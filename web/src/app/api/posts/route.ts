import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    // Headers de cache réduits pour avoir des données plus fraîches
    const headers = {
      'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
    };

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userIdParam = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Récupérer les amis de l'utilisateur
    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          {
            OR: [
              { initiatorId: userId },
              { receiverId: userId },
            ],
          },
          { status: 'ACCEPTED' },
        ],
      },
    });

    const friendIds = friendships.map((f: { initiatorId: string; receiverId: string }) =>
      f.initiatorId === userId ? f.receiverId : f.initiatorId
    );

    let whereCondition: any = {};

    if (type === 'PUBLIC') {
      whereCondition = { type: 'PUBLIC' };
    } else if (userIdParam) {
      whereCondition = { authorId: userIdParam };
    } else {
      // Afficher : posts publics + posts FRIENDS des amis + posts des amis (même publics)
      whereCondition = {
        OR: [
          { type: 'PUBLIC' },
          {
            AND: [
              { type: 'FRIENDS' },
              { authorId: { in: [...friendIds, userId] } },
            ],
          },
          // Inclure les posts des amis même s'ils sont publics
          {
            authorId: { in: friendIds },
          },
        ],
      };
    }

    const posts = await prisma.post.findMany({
      where: whereCondition,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const postsWithLikeStatus = posts.map((post: any) => ({
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined,
    }));

    return NextResponse.json(postsWithLikeStatus, { headers });
  } catch (error: any) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const body = await request.json();
    const { content, type = 'PUBLIC' } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Le contenu est requis' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content,
        type,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du post' },
      { status: 500 }
    );
  }
}

