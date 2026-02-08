-- Migration safe: Make rating optional
-- Vérifie si la colonne rating est déjà nullable avant de la modifier

DO $$ 
BEGIN
    -- Vérifier si la colonne rating est NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'book_reviews' 
        AND column_name = 'rating' 
        AND is_nullable = 'NO'
    ) THEN
        -- Rendre la colonne nullable
        ALTER TABLE "book_reviews" ALTER COLUMN "rating" DROP NOT NULL;
        RAISE NOTICE 'Column rating is now nullable';
    ELSE
        RAISE NOTICE 'Column rating is already nullable';
    END IF;
END $$;
