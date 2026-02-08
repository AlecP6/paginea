import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Obtenir toutes les conversations de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { userId } = authResult;

    // Récupérer toutes les conversations où l'utilisateur est participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Dernier message pour l'aperçu
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: userId,
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Formatter les conversations pour inclure l'ami et les infos du dernier message
    const formattedConversations = conversations.map((conv) => {
      const friend = conv.user1Id === userId ? conv.user2 : conv.user1;
      const lastMessage = conv.messages[0] || null;
      const unreadCount = conv._count.messages;

      return {
        id: conv.id,
        friend,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId,
          isRead: lastMessage.isRead,
        } : null,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des conversations' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle conversation ou récupérer une existante
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { userId } = authResult;
    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json(
        { error: 'L\'ID de l\'ami est requis' },
        { status: 400 }
      );
    }

    // Vérifier que les utilisateurs sont amis
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: userId, receiverId: friendId, status: 'ACCEPTED' },
          { initiatorId: friendId, receiverId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Vous devez être amis pour démarrer une conversation' },
        { status: 403 }
      );
    }

    // Vérifier si une conversation existe déjà
    const [user1Id, user2Id] = userId < friendId ? [userId, friendId] : [friendId, userId];
    
    let conversation = await prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id,
        },
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Si la conversation n'existe pas, la créer
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id,
          user2Id,
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });
    }

    const friend = conversation.user1Id === userId ? conversation.user2 : conversation.user1;

    return NextResponse.json({
      id: conversation.id,
      friend,
      createdAt: conversation.createdAt,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la conversation' },
      { status: 500 }
    );
  }
}
