import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { put, del } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux (max 5MB)' },
        { status: 400 }
      );
    }

    // Vérifier le type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPEG, PNG, GIF ou WebP.' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur actuel pour supprimer l'ancien avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Générer un nom unique pour le fichier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `avatar-${userId}-${uniqueSuffix}.${ext}`;

    // Upload vers Vercel Blob Storage
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    });

    // Supprimer l'ancien avatar si c'est un blob Vercel
    if (currentUser?.avatar && currentUser.avatar.includes('blob.vercel-storage.com')) {
      try {
        await del(currentUser.avatar);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
        // On continue même si la suppression échoue
      }
    }

    // Mettre à jour le profil avec la nouvelle URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: blob.url },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}

