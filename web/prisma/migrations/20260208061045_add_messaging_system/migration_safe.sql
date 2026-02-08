-- Migration sécurisée avec vérification d'existence

-- CreateTable conversations (si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversations') THEN
        CREATE TABLE "conversations" (
            "id" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "user1Id" TEXT NOT NULL,
            "user2Id" TEXT NOT NULL,
            CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
        );
        
        CREATE UNIQUE INDEX "conversations_user1Id_user2Id_key" ON "conversations"("user1Id", "user2Id");
        
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user1Id_fkey" 
            FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user2Id_fkey" 
            FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable messages (si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages') THEN
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
        
        ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" 
            FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" 
            FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" 
            FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
