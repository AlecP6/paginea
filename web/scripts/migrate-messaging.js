#!/usr/bin/env node

/**
 * Script de migration manuelle pour créer les tables de messagerie
 * À exécuter si prisma migrate deploy échoue
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Début de la migration manuelle...');

  try {
    // Vérifier si la table conversations existe
    const conversationsExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations'
      );
    `;

    if (!conversationsExists[0].exists) {
      console.log('📋 Création de la table conversations...');
      await prisma.$executeRaw`
        CREATE TABLE "conversations" (
          "id" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "user1Id" TEXT NOT NULL,
          "user2Id" TEXT NOT NULL,
          CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
        );
      `;

      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "conversations_user1Id_user2Id_key" 
        ON "conversations"("user1Id", "user2Id");
      `;

      await prisma.$executeRaw`
        ALTER TABLE "conversations" 
        ADD CONSTRAINT "conversations_user1Id_fkey" 
        FOREIGN KEY ("user1Id") REFERENCES "users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `;

      await prisma.$executeRaw`
        ALTER TABLE "conversations" 
        ADD CONSTRAINT "conversations_user2Id_fkey" 
        FOREIGN KEY ("user2Id") REFERENCES "users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `;

      console.log('✅ Table conversations créée');
    } else {
      console.log('✅ Table conversations existe déjà');
    }

    // Vérifier si la table messages existe
    const messagesExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'messages'
      );
    `;

    if (!messagesExists[0].exists) {
      console.log('📋 Création de la table messages...');
      await prisma.$executeRaw`
        CREATE TABLE "messages" (
          "id" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "isRead" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "senderId" TEXT NOT NULL,
          "receiverId" TEXT NOT NULL,
          "conversationId" TEXT NOT NULL,
          CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
        );
      `;

      await prisma.$executeRaw`
        ALTER TABLE "messages" 
        ADD CONSTRAINT "messages_senderId_fkey" 
        FOREIGN KEY ("senderId") REFERENCES "users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `;

      await prisma.$executeRaw`
        ALTER TABLE "messages" 
        ADD CONSTRAINT "messages_receiverId_fkey" 
        FOREIGN KEY ("receiverId") REFERENCES "users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `;

      await prisma.$executeRaw`
        ALTER TABLE "messages" 
        ADD CONSTRAINT "messages_conversationId_fkey" 
        FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `;

      console.log('✅ Table messages créée');
    } else {
      console.log('✅ Table messages existe déjà');
    }

    console.log('🎉 Migration manuelle terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
