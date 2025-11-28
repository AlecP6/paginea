import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const authResult = requireAuth(request);
  if ('error' in authResult) return authResult.error;
  const { userId } = authResult;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return {
      error: NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      ),
    };
  }

  return { userId };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const adminResult = await requireAdmin(request);
    if ('error' in adminResult) return adminResult.error;

    const { reportId } = params;
    const body = await request.json();
    const { status } = body;

    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du signalement' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const adminResult = await requireAdmin(request);
    if ('error' in adminResult) return adminResult.error;

    const { reportId } = params;

    await prisma.report.delete({
      where: { id: reportId },
    });

    return NextResponse.json({ message: 'Signalement supprimé' });
  } catch (error: any) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du signalement' },
      { status: 500 }
    );
  }
}

