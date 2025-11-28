'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Scale, Mail, Eye, Cookie } from 'lucide-react';

export default function LegalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white dark:text-white mb-4">
            Mentions Légales
          </h1>
          <p className="text-white dark:text-white">
            Dernière mise à jour : 27 novembre 2025
          </p>
        </div>

        {/* Éditeur du site */}
        <div className="card mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <Mail className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-white dark:text-white mb-4">
                1. Éditeur du site
              </h2>
            </div>
          </div>
          <div className="space-y-2 text-white dark:text-white">
            <p><strong>Nom du site :</strong> Paginea</p>
            <p><strong>Propriétaire :</strong> Santa</p>
            <p><strong>Adresse :</strong> France</p>
            <p><strong>Email :</strong> contact@paginea.fr</p>
          </div>
        </div>

        {/* Propriété intellectuelle */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-white dark:text-white mb-4">
            2. Propriété intellectuelle
          </h2>
          <div className="space-y-3 text-white dark:text-white">
            <p>
              L'ensemble du contenu du site Paginea (textes, images, vidéos, logos, icônes, etc.) 
              est protégé par le droit d'auteur, le droit des marques et/ou tout autre droit de 
              propriété intellectuelle.
            </p>
            <p>
              Ces contenus sont la propriété exclusive de Paginea ou de ses partenaires. 
              Toute reproduction, distribution, modification ou exploitation non autorisée 
              est strictement interdite et pourra faire l'objet de poursuites judiciaires.
            </p>
          </div>
        </div>

        {/* Données personnelles */}
        <div className="card mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-white dark:text-white mb-4">
                3. Protection des données personnelles
              </h2>
            </div>
          </div>
          <div className="space-y-3 text-white dark:text-white">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la 
              loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, 
              de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p>
              <strong>Données collectées :</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Informations de compte (email, nom d'utilisateur, nom, prénom)</li>
              <li>Critiques de livres et notes</li>
              <li>Publications et commentaires</li>
              <li>Liste d'amis et interactions</li>
            </ul>
            <p>
              <strong>Utilisation des données :</strong> Les données collectées sont utilisées 
              uniquement pour le fonctionnement du service Paginea et ne sont jamais partagées 
              avec des tiers à des fins commerciales.
            </p>
            <p>
              Pour exercer vos droits, contactez-nous via l'adresse email de contact.
            </p>
          </div>
        </div>

        {/* Cookies */}
        <div className="card mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <Cookie className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-white dark:text-white mb-4">
                4. Cookies
              </h2>
            </div>
          </div>
          <div className="space-y-3 text-white dark:text-white">
            <p>
              Le site Paginea utilise des cookies pour améliorer votre expérience utilisateur 
              et assurer le bon fonctionnement du service.
            </p>
            <p>
              <strong>Types de cookies utilisés :</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (authentification)</li>
              <li><strong>Cookies de préférences :</strong> Mémorisation de vos choix (thème sombre/clair)</li>
            </ul>
            <p>
              Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines 
              fonctionnalités du site pourraient ne plus être disponibles.
            </p>
          </div>
        </div>

        {/* Responsabilité */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-white dark:text-white mb-4">
            5. Limitation de responsabilité
          </h2>
          <div className="space-y-3 text-white dark:text-white">
            <p>
              Paginea s'efforce de fournir un service de qualité, mais ne peut garantir 
              l'absence totale d'erreurs ou d'interruptions.
            </p>
            <p>
              L'utilisateur est seul responsable du contenu qu'il publie sur la plateforme. 
              Paginea se réserve le droit de modérer et de supprimer tout contenu inapproprié, 
              offensant ou contraire aux conditions d'utilisation.
            </p>
            <p>
              Paginea ne saurait être tenu responsable des dommages directs ou indirects 
              résultant de l'utilisation du site.
            </p>
          </div>
        </div>

        {/* Droit applicable */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-white dark:text-white mb-4">
            6. Droit applicable et juridiction
          </h2>
          <div className="space-y-3 text-white dark:text-white">
            <p>
              Les présentes mentions légales sont régies par le droit français.
            </p>
            <p>
              En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="card bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700">
          <h2 className="text-2xl font-bold text-white dark:text-white mb-4">
            📧 Contact
          </h2>
          <p className="text-white dark:text-white mb-4">
            Pour toute question concernant ces mentions légales ou vos données personnelles, 
            n'hésitez pas à nous contacter :
          </p>
          <div className="space-y-2 text-white dark:text-white">
            <p><strong>Email :</strong> contact@paginea.fr</p>
          </div>
        </div>

        {/* Retour */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.back()}
            className="btn-secondary"
          >
            ← Retour
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-white dark:text-white">
          <p>&copy; 2025 Paginea. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

