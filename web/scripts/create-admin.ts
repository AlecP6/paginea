import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis .env
// Essayer plusieurs chemins possibles
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '../.env') });
config({ path: resolve(process.cwd(), '../../.env') });

// Vérifier que DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL n\'est pas défini dans les variables d\'environnement');
  console.error('   Assurez-vous que le fichier .env existe et contient DATABASE_URL');
  process.exit(1);
}

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const username = 'Santa';
    const email = 'santa@paginea.fr';
    const password = 'Liqini@6';

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
      } else {
        console.log(`ℹ️  L'utilisateur "${username}" est déjà admin`);
      }
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

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
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

