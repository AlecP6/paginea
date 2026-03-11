'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SEOHead from '@/components/SEOHead';
import { Shield, Cookie, Database, Eye, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Politique de Confidentialité"
        description="Politique de confidentialité de Paginea. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles."
        keywords="politique de confidentialité, RGPD, protection des données, cookies, vie privée"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-white">
            Dernière mise à jour : 8 février 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary-600" />
              Introduction
            </h2>
            <p className="text-white mb-4">
              Chez Paginea, nous prenons la protection de vos données personnelles très au sérieux. 
              Cette politique de confidentialité explique comment nous collectons, utilisons, partageons 
              et protégeons vos informations personnelles lorsque vous utilisez notre plateforme.
            </p>
            <p className="text-white">
              En utilisant Paginea, vous acceptez les pratiques décrites dans cette politique.
            </p>
          </div>

          {/* Données collectées */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-primary-600" />
              Données Collectées
            </h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">
              1. Informations que vous nous fournissez
            </h3>
            <ul className="list-disc list-inside text-white mb-4 space-y-2">
              <li><strong>Compte utilisateur</strong> : nom d'utilisateur, adresse e-mail, mot de passe (crypté)</li>
              <li><strong>Profil</strong> : photo de profil, biographie, préférences de lecture</li>
              <li><strong>Contenu</strong> : critiques de livres, posts, commentaires, notes</li>
              <li><strong>Interactions sociales</strong> : amis, likes, messages privés</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">
              2. Informations collectées automatiquement
            </h3>
            <ul className="list-disc list-inside text-white mb-4 space-y-2">
              <li><strong>Données techniques</strong> : adresse IP, type de navigateur, système d'exploitation</li>
              <li><strong>Cookies</strong> : identifiants de session, préférences utilisateur</li>
              <li><strong>Analytiques</strong> : pages visitées, temps passé, interactions</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">
              3. Données tierces
            </h3>
            <ul className="list-disc list-inside text-white space-y-2">
              <li><strong>Google AdSense</strong> : cookies publicitaires pour personnalisation des annonces</li>
              <li><strong>Amazon Associates</strong> : clics sur liens affiliés (anonymes)</li>
            </ul>
          </div>

          {/* Utilisation des données */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4">
              Utilisation des Données
            </h2>
            <p className="text-white mb-3">
              Nous utilisons vos données pour :
            </p>
            <ul className="list-disc list-inside text-white space-y-2">
              <li>Fournir et améliorer nos services</li>
              <li>Personnaliser votre expérience utilisateur</li>
              <li>Gérer votre compte et authentification</li>
              <li>Faciliter les interactions sociales (amis, commentaires)</li>
              <li>Afficher des publicités pertinentes (Google AdSense)</li>
              <li>Analyser l'utilisation de la plateforme</li>
              <li>Communiquer avec vous (notifications, support)</li>
              <li>Prévenir les abus et fraudes</li>
            </ul>
          </div>

          {/* Cookies */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Cookie className="w-6 h-6 text-primary-600" />
              Cookies et Technologies Similaires
            </h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">
              Types de cookies utilisés
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">
                  1. Cookies essentiels (nécessaires)
                </h4>
                <p className="text-white">
                  Permettent l'authentification et la navigation. Ne peuvent pas être désactivés.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">
                  2. Cookies de performance
                </h4>
                <p className="text-white">
                  Collectent des informations sur l'utilisation du site pour améliorer nos services.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">
                  3. Cookies publicitaires (Google AdSense)
                </h4>
                <p className="text-white mb-2">
                  Google utilise des cookies pour afficher des annonces personnalisées basées sur vos 
                  visites sur ce site et d'autres sites Internet.
                </p>
                <p className="text-white">
                  Vous pouvez gérer vos préférences publicitaires sur : 
                  <a 
                    href="https://adssettings.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-400 ml-1 underline"
                  >
                    Google Ads Settings
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Partage des données */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4">
              Partage des Données
            </h2>
            <p className="text-white mb-3">
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations avec :
            </p>
            <ul className="list-disc list-inside text-white space-y-2">
              <li><strong>Autres utilisateurs</strong> : profil public, critiques, posts (selon vos paramètres)</li>
              <li><strong>Google AdSense</strong> : données anonymes pour publicités ciblées</li>
              <li><strong>Amazon Associates</strong> : clics anonymes sur liens affiliés</li>
              <li><strong>Services d'hébergement</strong> : Vercel (serveur), Neon (base de données)</li>
              <li><strong>Autorités légales</strong> : si requis par la loi</li>
            </ul>
          </div>

          {/* Sécurité */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4">
              Sécurité des Données
            </h2>
            <p className="text-white mb-3">
              Nous mettons en œuvre des mesures de sécurité pour protéger vos données :
            </p>
            <ul className="list-disc list-inside text-white space-y-2">
              <li>Chiffrement des mots de passe (bcrypt, 12 rounds)</li>
              <li>Connexion HTTPS/SSL pour toutes les communications</li>
              <li>Authentification JWT sécurisée</li>
              <li>Rate limiting pour prévenir les abus</li>
              <li>Sauvegardes régulières des données</li>
              <li>Accès restreint aux données sensibles</li>
            </ul>
          </div>

          {/* Vos droits RGPD */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4">
              Vos Droits (RGPD)
            </h2>
            <p className="text-white mb-3">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside text-white space-y-2">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement</strong> : supprimer votre compte et données</li>
              <li><strong>Droit à la portabilité</strong> : exporter vos données</li>
              <li><strong>Droit d'opposition</strong> : refuser le traitement de vos données</li>
              <li><strong>Droit de limitation</strong> : restreindre l'utilisation de vos données</li>
            </ul>
            <p className="text-white mt-4">
              Pour exercer ces droits, contactez-nous à : 
              <a 
                href="mailto:contact@paginea.fr" 
                className="text-primary-500 hover:text-primary-400 ml-1"
              >
                contact@paginea.fr
              </a>
            </p>
          </div>

          {/* Conservation */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4">
              Conservation des Données
            </h2>
            <p className="text-white mb-3">
              Nous conservons vos données tant que votre compte est actif. En cas de suppression :
            </p>
            <ul className="list-disc list-inside text-white space-y-2">
              <li><strong>Suppression immédiate</strong> : profil, préférences, sessions</li>
              <li><strong>Anonymisation (7 jours)</strong> : posts, critiques publiques</li>
              <li><strong>Conservation légale (1 an)</strong> : logs de sécurité, transactions</li>
            </ul>
          </div>

          {/* Mineurs */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4">
              Protection des Mineurs
            </h2>
            <p className="text-white">
              Paginea est destiné aux personnes âgées de 13 ans et plus. Nous ne collectons 
              pas sciemment de données d'enfants de moins de 13 ans. Si vous pensez qu'un mineur 
              a fourni des informations, contactez-nous immédiatement.
            </p>
          </div>

          {/* Modifications */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4">
              Modifications de cette Politique
            </h2>
            <p className="text-white">
              Nous pouvons mettre à jour cette politique de confidentialité périodiquement. 
              Les modifications importantes seront notifiées par e-mail ou via une notification 
              sur le site. La date de "dernière mise à jour" sera actualisée en haut de cette page.
            </p>
          </div>

          {/* Contact */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-primary-600" />
              Nous Contacter
            </h2>
            <p className="text-white mb-4">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
            </p>
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
              <p className="text-white">
                <strong>Email :</strong> 
                <a 
                  href="mailto:contact@paginea.fr" 
                  className="text-primary-600 dark:text-primary-400 hover:underline ml-2"
                >
                  contact@paginea.fr
                </a>
              </p>
              <p className="text-white mt-2">
                <strong>Adresse :</strong> Paginea, France
              </p>
            </div>
          </div>

          {/* Google AdSense Notice */}
          <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700">
            <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-3">
              ℹ️ Information sur la Publicité
            </h2>
            <p className="text-yellow-800 dark:text-yellow-200 mb-3">
              Paginea utilise <strong>Google AdSense</strong> pour afficher des publicités. 
              Google peut utiliser des cookies pour personnaliser les annonces en fonction de vos 
              visites sur ce site et d'autres sites.
            </p>
            <p className="text-yellow-800 dark:text-yellow-200 mb-3">
              Vous pouvez désactiver les annonces personnalisées en visitant :
            </p>
            <a 
              href="https://adssettings.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Gérer mes préférences publicitaires
            </a>
          </div>

          {/* Amazon Affiliate Notice */}
          <div className="card bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700">
            <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-3">
              ℹ️ Programme Partenaires Amazon
            </h2>
            <p className="text-amber-800 dark:text-amber-200">
              En tant que Partenaire Amazon, Paginea réalise un bénéfice sur les achats 
              remplissant les conditions requises. Les liens vers Amazon sont identifiés 
              avec notre tag partenaire, mais ne collectent aucune donnée personnelle 
              supplémentaire au-delà de ce qui est décrit dans cette politique.
            </p>
          </div>
        </div>

        {/* Bouton retour */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Retour à l'accueil
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left text-white">
            <p>&copy; 2026 Paginea. Tous droits réservés.</p>
          </div>
          <div className="flex space-x-6">
            <button
              onClick={() => router.push('/about')}
              className="text-white hover:text-primary-400 transition-colors"
            >
              À propos
            </button>
            <button
              onClick={() => router.push('/legal')}
              className="text-white hover:text-primary-400 transition-colors"
            >
              Mentions légales
            </button>
            <button
              onClick={() => router.push('/privacy')}
              className="text-white hover:text-primary-400 transition-colors font-semibold"
            >
              Confidentialité
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
