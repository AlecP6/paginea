import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Supprimer un message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { userId } = authResult;
    const { messageId } = params;

    // Vérifier que le message existe et appartient à l'utilisateur
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }

    if (message.senderId !== userId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez supprimer que vos propres messages' },
        { status: 403 }
      );
    }

    // Supprimer le message
    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du message' },
      { status: 500 }
    );
  }
}
