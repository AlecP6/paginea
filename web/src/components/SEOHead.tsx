'use client';

import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export default function SEOHead({ 
  title, 
  description, 
  keywords,
  ogImage = '/logo.png'
}: SEOHeadProps) {
  useEffect(() => {
    // Mettre à jour le titre de la page
    if (title) {
      document.title = `${title} | Paginea`;
    }

    // Mettre à jour ou créer les balises meta
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Description
    if (description) {
      updateMetaTag('description', description);
    }

    // Keywords
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Open Graph
    if (title) {
      updateMetaTag('og:title', `${title} | Paginea`, 'property');
    }
    if (description) {
      updateMetaTag('og:description', description, 'property');
    }
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:site_name', 'Paginea', 'property');

    // Twitter Card
    if (title) {
      updateMetaTag('twitter:title', `${title} | Paginea`);
    }
    if (description) {
      updateMetaTag('twitter:description', description);
    }
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:card', 'summary_large_image');
  }, [title, description, keywords, ogImage]);

  return null;
}

