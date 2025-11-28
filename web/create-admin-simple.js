const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const username = 'Santa';
    const email = 'santa@paginea.fr';
    const password = 'Liqini@6';

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL n\'est pas défini');
      console.error('   Définissez DATABASE_URL dans votre fichier .env ou comme variable d\'environnement');
      process.exit(1);
    }

    console.log('🔍 Vérification de l\'utilisateur existant...');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      // Mettre à jour le rôle si l'utilisateur existe
      if (existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: 'ADMIN' },
        });
        console.log(`✅ Utilisateur "${username}" mis à jour avec le rôle ADMIN`);
        console.log(`   Username: ${existingUser.username}`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Role: ADMIN`);
      } else {
        console.log(`ℹ️  L'utilisateur "${username}" est déjà admin`);
        console.log(`   Username: ${existingUser.username}`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Role: ${existingUser.role}`);
      }
      return;
    }

    console.log('🔐 Hachage du mot de passe...');
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('👤 Création du compte admin...');
    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log(`✅ Compte admin créé avec succès !`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`\n🔑 Identifiants de connexion :`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error.message);
    if (error.code === 'P1001') {
      console.error('   Problème de connexion à la base de données. Vérifiez DATABASE_URL.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

