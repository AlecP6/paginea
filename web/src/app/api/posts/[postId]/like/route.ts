import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { postId } = params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post non trouvé' },
        { status: 404 }
      );
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: 'Post déjà liké' },
        { status: 400 }
      );
    }

    const like = await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    return NextResponse.json(like, { status: 201 });
  } catch (error: any) {
    console.error('Like post error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du like' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const { postId } = params;

    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!like) {
      return NextResponse.json(
        { error: 'Like non trouvé' },
        { status: 404 }
      );
    }

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return NextResponse.json({ message: 'Like retiré' });
  } catch (error: any) {
    console.error('Unlike post error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du retrait du like' },
      { status: 500 }
    );
  }
}

