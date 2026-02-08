'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  type?: 'WebSite' | 'Organization' | 'WebPage' | 'Article' | 'Book' | 'Review' | 'Person' | 'SocialMediaPosting';
  data?: any;
}

export default function StructuredData({ type = 'WebSite', data }: StructuredDataProps) {
  useEffect(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.paginea.fr';
    
    let structuredData: any = {
      '@context': 'https://schema.org',
      '@type': type,
    };

    // Configuration selon le type
    switch (type) {
      case 'WebSite':
        structuredData = {
          ...structuredData,
          name: 'Paginea',
          alternateName: 'Paginea - Réseau Social Littéraire',
          description: 'Partagez vos lectures, découvrez de nouveaux livres et échangez avec une communauté passionnée de lecteurs.',
          url: siteUrl,
          logo: `${siteUrl}/logo.png`,
          image: `${siteUrl}/logo.png`,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteUrl}/books?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          sameAs: [
            // Ajoutez vos réseaux sociaux ici
            // 'https://www.facebook.com/paginea',
            // 'https://twitter.com/paginea',
            // 'https://www.instagram.com/paginea',
          ],
          inLanguage: 'fr-FR',
          publisher: {
            '@type': 'Organization',
            name: 'Paginea',
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/logo.png`,
            },
          },
        };
        break;

      case 'Organization':
        structuredData = {
          ...structuredData,
          name: 'Paginea',
          alternateName: 'Paginea - Réseau Social Littéraire',
          url: siteUrl,
          logo: `${siteUrl}/logo.png`,
          image: `${siteUrl}/logo.png`,
          description: 'Réseau social dédié aux passionnés de lecture. Partagez vos avis, découvrez de nouveaux livres et connectez-vous avec d\'autres lecteurs.',
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'contact@paginea.fr',
            contactType: 'Customer Service',
            availableLanguage: ['French'],
          },
          sameAs: [
            // Vos réseaux sociaux
          ],
          foundingDate: '2026',
          founder: {
            '@type': 'Person',
            name: 'Paginea Team',
          },
        };
        break;

      case 'WebPage':
        structuredData = {
          ...structuredData,
          name: data?.title || 'Paginea',
          description: data?.description || 'Partagez vos lectures et découvrez de nouveaux livres',
          url: data?.url || siteUrl,
          inLanguage: 'fr-FR',
          isPartOf: {
            '@type': 'WebSite',
            name: 'Paginea',
            url: siteUrl,
          },
          breadcrumb: data?.breadcrumb,
        };
        break;

      case 'Article':
      case 'SocialMediaPosting':
        structuredData = {
          ...structuredData,
          headline: data?.title,
          description: data?.description,
          image: data?.image || `${siteUrl}/logo.png`,
          datePublished: data?.publishedTime,
          dateModified: data?.modifiedTime || data?.publishedTime,
          author: {
            '@type': 'Person',
            name: data?.author || 'Paginea User',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Paginea',
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/logo.png`,
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data?.url || siteUrl,
          },
          inLanguage: 'fr-FR',
        };
        break;

      case 'Book':
        structuredData = {
          ...structuredData,
          name: data?.title,
          author: {
            '@type': 'Person',
            name: data?.author,
          },
          isbn: data?.isbn,
          bookFormat: 'Paperback',
          image: data?.image,
          description: data?.description,
          inLanguage: 'fr-FR',
          aggregateRating: data?.rating ? {
            '@type': 'AggregateRating',
            ratingValue: data.rating,
            bestRating: 5,
            worstRating: 1,
          } : undefined,
        };
        break;

      case 'Review':
        structuredData = {
          ...structuredData,
          itemReviewed: {
            '@type': 'Book',
            name: data?.bookTitle,
            author: {
              '@type': 'Person',
              name: data?.bookAuthor,
            },
            image: data?.bookImage,
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: data?.rating,
            bestRating: 5,
            worstRating: 1,
          },
          author: {
            '@type': 'Person',
            name: data?.author,
          },
          reviewBody: data?.reviewText,
          datePublished: data?.publishedTime,
          publisher: {
            '@type': 'Organization',
            name: 'Paginea',
          },
        };
        break;
    }

    // Merger avec les données personnalisées
    const finalData = { ...structuredData, ...data };

    // Supprimer l'ancien script
    const existingScript = document.getElementById(`structured-data-${type}`);
    if (existingScript) {
      existingScript.remove();
    }

    // Créer et ajouter le nouveau script
    const script = document.createElement('script');
    script.id = `structured-data-${type}`;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(finalData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(`structured-data-${type}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null;
}
