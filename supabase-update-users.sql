-- ============================================
-- ACTUALIZACIÓN: Agregar campo photo_url a users
-- ============================================
-- Si ya ejecutaste el script principal y necesitas agregar el campo photo_url,
-- ejecuta este script

-- Agregar columna photo_url si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE users ADD COLUMN photo_url TEXT;
  END IF;
END $$;

-- Nota: Si quieres migrar datos de avatar_url a photo_url:
-- UPDATE users SET photo_url = avatar_url WHERE photo_url IS NULL AND avatar_url IS NOT NULL;

