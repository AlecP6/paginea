# 🔐 Commandes de Sécurité Paginea
*Commandes utiles pour la gestion de la sécurité*

---

## 🔑 GÉNÉRATION DE SECRETS

### JWT Secret (Recommandé : 32 caractères)
```bash
# Générer un secret JWT fort
openssl rand -base64 32

# Exemple de sortie :
# xP8mK9vL2nR4tY6wZ1aB3cD5eF7gH9jK0lM2nO4pQ6=
```

### Secret de 64 caractères
```bash
openssl rand -base64 64
```

### Secret hexadécimal
```bash
openssl rand -hex 32
```

---

## 🧪 TESTS DE SÉCURITÉ

### Test Rate Limiting (Login)
```bash
# Tenter 6 connexions pour déclencher le rate limit
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done
```

### Test Validation Mot de Passe
```bash
# Devrait échouer (trop court)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"abc123"}'

# Devrait échouer (pas de majuscule)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"abcdef12"}'

# Devrait réussir
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"Abc12345"}'
```

### Test JWT Token
```bash
# Connexion et récupération du token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Abc12345"}' \
  | jq -r '.token')

# Utiliser le token pour accéder à une route protégée
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test En-têtes de Sécurité
```bash
# Vérifier tous les en-têtes de sécurité
curl -I https://votresite.com

# Chercher des en-têtes spécifiques
curl -I https://votresite.com | grep -E "(X-Frame-Options|Content-Security-Policy|Strict-Transport-Security)"
```

---

## 🔍 AUDIT ET MONITORING

### Audit NPM
```bash
# Vérifier les vulnérabilités dans les dépendances
cd /Users/alex/Documents/Paginea/web
npm audit

# Corriger automatiquement (non-breaking changes)
npm audit fix

# Corriger avec breaking changes (attention !)
npm audit fix --force

# Voir le rapport détaillé
npm audit --json
```

### Mise à Jour des Dépendances
```bash
# Voir les packages obsolètes
npm outdated

# Mettre à jour vers la dernière version mineure
npm update

# Mettre à jour un package spécifique
npm install bcrypt@latest
```

### Vérifier la Taille du Hash bcrypt
```bash
# Dans Node.js (pour tester)
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('test', 12).then(h => console.log('Hash:', h, '\nLength:', h.length))"
```

---

## 📊 LOGS ET DEBUGGING

### Logs de Connexion (en développement)
```bash
# Démarrer Next.js avec logs détaillés
cd /Users/alex/Documents/Paginea/web
NODE_ENV=development npm run dev
```

### Analyser les Logs
```bash
# Chercher les tentatives de connexion échouées
grep "Login error" logs/app.log

# Compter les rate limits déclenchés
grep "Rate limit exceeded" logs/app.log | wc -l

# Dernières erreurs JWT
grep "Token" logs/app.log | tail -20
```

### Debug JWT en CLI
```bash
# Décoder un JWT (partie visible, pas de vérification)
echo "VOTRE_TOKEN_ICI" | cut -d. -f2 | base64 -d | jq

# Exemple complet
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJpYXQiOjE2NDA5OTUyMDB9.abcdef"
echo $TOKEN | cut -d. -f2 | base64 -d | jq
```

---

## 🗄️ BASE DE DONNÉES

### Sauvegardes PostgreSQL
```bash
# Backup de la base de données
pg_dump -h localhost -U username -d paginea > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup avec compression
pg_dump -h localhost -U username -d paginea | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restaurer un backup
psql -h localhost -U username -d paginea < backup_20260207_120000.sql
```

### Requêtes Utiles
```sql
-- Compter les utilisateurs par date de création
SELECT DATE(created_at), COUNT(*) 
FROM "User" 
GROUP BY DATE(created_at) 
ORDER BY DATE(created_at) DESC;

-- Utilisateurs créés dans les dernières 24h
SELECT COUNT(*) 
FROM "User" 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Vérifier les mots de passe hashés (devrait commencer par $2b$12$)
SELECT id, email, substring(password, 1, 7) as hash_prefix 
FROM "User" 
LIMIT 5;
```

---

## 🧹 MAINTENANCE

### Nettoyer les Dépendances
```bash
# Supprimer node_modules
cd /Users/alex/Documents/Paginea/web
rm -rf node_modules

# Supprimer package-lock
rm package-lock.json

# Réinstaller proprement
npm install
```

### Régénérer Prisma Client
```bash
cd /Users/alex/Documents/Paginea/web
npx prisma generate
```

### Build de Production
```bash
# Build Next.js
cd /Users/alex/Documents/Paginea/web
npm run build

# Tester le build localement
npm start
```

---

## 🔐 GESTION DES VARIABLES D'ENVIRONNEMENT

### Créer .env.local
```bash
cd /Users/alex/Documents/Paginea/web

# Générer et ajouter JWT_SECRET
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env.local

# Ajouter DATABASE_URL
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/paginea" >> .env.local

# Ajouter NEXT_PUBLIC_SITE_URL
echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000" >> .env.local
```

### Vérifier les Variables
```bash
# Afficher les variables (sans valeurs sensibles)
cat .env.local | grep -v "SECRET\|PASSWORD"

# Vérifier qu'une variable est définie
node -e "console.log(process.env.JWT_SECRET ? '✓ JWT_SECRET défini' : '✗ JWT_SECRET manquant')"
```

---

## 🚀 DÉPLOIEMENT

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Déployer
cd /Users/alex/Documents/Paginea/web
vercel

# Définir les variables d'environnement
vercel env add JWT_SECRET production
# Copier la valeur générée avec: openssl rand -base64 32

vercel env add DATABASE_URL production
# Copier l'URL de votre base de données PostgreSQL
```

### Variables d'Environnement Vercel
```bash
# Lister les variables
vercel env ls

# Supprimer une variable
vercel env rm JWT_SECRET production

# Pull les variables localement (dev uniquement)
vercel env pull .env.local
```

---

## 🧪 TESTS AUTOMATISÉS

### Test de Charge (avec Apache Bench)
```bash
# Installer Apache Bench (macOS)
# Déjà installé sur la plupart des systèmes

# Test de charge sur page d'accueil
ab -n 1000 -c 10 http://localhost:3000/

# Test avec authentification
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/auth/me
```

### Test de Sécurité avec OWASP ZAP
```bash
# Installer OWASP ZAP
brew install --cask owasp-zap

# Scanner automatique
zap-cli quick-scan --self-contained http://localhost:3000
```

---

## 📈 MONITORING

### Logs en Production (Vercel)
```bash
# Voir les logs en temps réel
vercel logs --follow

# Logs des dernières 24h
vercel logs --since 24h

# Logs avec erreurs uniquement
vercel logs | grep ERROR
```

### Health Check
```bash
# Vérifier que l'API répond
curl http://localhost:3000/api/health

# Avec timeout
curl --max-time 5 http://localhost:3000/api/health

# En boucle (monitoring)
watch -n 5 'curl -s http://localhost:3000/api/health | jq'
```

---

## 🆘 DÉPANNAGE

### JWT_SECRET Non Défini
```bash
# Erreur: "JWT_SECRET not configured"
# Solution:
cd /Users/alex/Documents/Paginea/web
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local
npm run dev
```

### Rate Limit Déclenché en Développement
```bash
# Redémarrer le serveur pour reset
killall node
npm run dev
```

### Base de Données Inaccessible
```bash
# Vérifier que PostgreSQL tourne
pg_isready

# Vérifier la connexion
psql $DATABASE_URL -c "SELECT 1"

# Régénérer le client Prisma
npx prisma generate
npx prisma db push
```

### Bcrypt Erreur de Build
```bash
# Rebuilder bcrypt pour votre plateforme
npm rebuild bcrypt --build-from-source
```

---

## 📚 RESSOURCES UTILES

### Commandes de Vérification Rapide
```bash
# Tout vérifier d'un coup
echo "=== NPM Audit ===" && npm audit
echo "\n=== Outdated Packages ===" && npm outdated
echo "\n=== JWT_SECRET ===" && node -e "console.log(process.env.JWT_SECRET ? '✓ Défini' : '✗ Manquant')"
echo "\n=== Database ===" && npx prisma db pull --force
```

### Aliases Utiles (ajoutez à ~/.zshrc)
```bash
# Aliases Paginea
alias pag-dev='cd /Users/alex/Documents/Paginea/web && npm run dev'
alias pag-jwt='openssl rand -base64 32'
alias pag-audit='cd /Users/alex/Documents/Paginea/web && npm audit'
alias pag-logs='cd /Users/alex/Documents/Paginea/web && vercel logs --follow'
```

---

**Dernière mise à jour** : 7 février 2026  
**Version** : 1.0
