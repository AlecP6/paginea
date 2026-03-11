import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { put, del } from '@vercel/blob';

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    const { userId } = authResult;

    // Vérifier que la critique existe et appartient à l'utilisateur
    const review = await prisma.bookReview.findUnique({
      where: { id: params.reviewId },
      select: { 
        id: true, 
        authorId: true, 
        bookCover: true,
        bookTitle: true
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Critique non trouvée' },
        { status: 404 }
      );
    }

    if (review.authorId !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier cette critique' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('cover') as File;

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

    // Générer un nom unique pour le fichier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.name.split('.').pop() || 'jpg';
    // Utiliser le titre du livre dans le nom pour faciliter l'identification
    const sanitizedTitle = review.bookTitle.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50);
    const fileName = `book-cover-${sanitizedTitle}-${params.reviewId}-${uniqueSuffix}.${ext}`;

    // Upload vers Vercel Blob Storage
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    });

    console.log('📚 Couverture uploadée:', {
      reviewId: params.reviewId,
      bookTitle: review.bookTitle,
      oldCover: review.bookCover,
      newCover: blob.url,
    });

    // Supprimer l'ancienne couverture si c'est un blob Vercel
    if (review.bookCover && review.bookCover.includes('blob.vercel-storage.com')) {
      try {
        await del(review.bookCover);
        console.log('🗑️ Ancienne couverture supprimée:', review.bookCover);
      } catch (error) {
        console.error('Erreur suppression ancienne couverture:', error);
        // On continue même si la suppression échoue
      }
    }

    // Mettre à jour la critique avec la nouvelle URL
    const updatedReview = await prisma.bookReview.update({
      where: { id: params.reviewId },
      data: { bookCover: blob.url },
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

    console.log('✅ Critique mise à jour avec nouvelle couverture');

    return NextResponse.json(updatedReview);
  } catch (error: any) {
    console.error('Upload book cover error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de la couverture' },
      { status: 500 }
    );
  }
}
