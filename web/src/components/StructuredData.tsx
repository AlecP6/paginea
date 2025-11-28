'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  type?: 'WebSite' | 'Organization' | 'WebPage';
  data?: any;
}

export default function StructuredData({ type = 'WebSite', data }: StructuredDataProps) {
  useEffect(() => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
      name: 'Paginea',
      description: 'Réseau social de lecture pour partager vos avis et découvrir de nouveaux livres',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
      sameAs: [
        // Ajoutez vos réseaux sociaux ici si vous en avez
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'contact@paginea.fr',
        contactType: 'Customer Service',
      },
      ...data,
    };

    // Supprimer l'ancien script s'il existe
    const existingScript = document.getElementById('structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Créer et ajouter le nouveau script
    const script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(baseData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null;
}

