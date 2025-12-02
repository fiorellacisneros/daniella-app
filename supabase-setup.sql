-- ============================================
-- DANIELLA APP - SUPABASE SETUP
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase
-- para crear las tablas necesarias

-- ============================================
-- 1. Tabla de Usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID UNIQUE, -- ID del usuario en Supabase Auth
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  photo_url TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Tabla de Tareas
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  points INTEGER DEFAULT 0,
  assigned_to TEXT,
  assigned_days TEXT[] DEFAULT '{}',
  due_date DATE,
  task_time TIME,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Tabla de Recordatorios
-- ============================================
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reminder_time TIME NOT NULL,
  days_of_week TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. Tabla de Premios (Rewards)
-- ============================================
CREATE TABLE IF NOT EXISTS rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points_required INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. Tabla de Premios Canjeados
-- ============================================
CREATE TABLE IF NOT EXISTS redeemed_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 6. Tabla de Puntos de Pareja (Couple Points)
-- ============================================
CREATE TABLE IF NOT EXISTS couple_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_points INTEGER DEFAULT 0,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. Tabla de Logros (Achievements)
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points_required INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. Tabla de Logros de Usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- 9. Función para actualizar puntos automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Sumar puntos cuando se completa una tarea
    UPDATE users
    SET total_points = total_points + COALESCE(NEW.points, 0)
    WHERE name = NEW.assigned_to;
  ELSIF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    -- Restar puntos si se desmarca como completada
    UPDATE users
    SET total_points = total_points - COALESCE(OLD.points, 0)
    WHERE name = OLD.assigned_to;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. Trigger para actualizar puntos
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_user_points ON tasks;
CREATE TRIGGER trigger_update_user_points
  AFTER UPDATE OF status ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();

-- ============================================
-- 11. Función para actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couple_points_updated_at BEFORE UPDATE ON couple_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. Habilitar Row Level Security (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE redeemed_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajusta según tu sistema de autenticación)
-- Por ahora, permitimos lectura/escritura a todos (para MVP)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on reminders" ON reminders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on achievements" ON achievements
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on user_achievements" ON user_achievements
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on rewards" ON rewards
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on redeemed_rewards" ON redeemed_rewards
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on couple_points" ON couple_points
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 13. Datos de ejemplo (opcional)
-- ============================================
-- Descomenta estas líneas si quieres datos de prueba

-- INSERT INTO users (name, email, total_points) VALUES
--   ('Usuario 1', 'usuario1@example.com', 0),
--   ('Usuario 2', 'usuario2@example.com', 0),
--   ('Usuario 3', 'usuario3@example.com', 0);

-- INSERT INTO rewards (name, description, icon, points_required) VALUES
--   ('Cupón Cine', 'Una noche de películas juntos', '🎬', 500),
--   ('Cena en Bistecca', 'Una cena especial para dos', '🍽️', 1000),
--   ('Masaje Relajante', 'Un masaje para relajarse', '💆', 750),
--   ('Día de Spa', 'Un día completo de relajación', '🧖', 1500);

-- INSERT INTO achievements (name, description, icon, points_required) VALUES
--   ('Primera Tarea', 'Completa tu primera tarea', '🏆', 0),
--   ('Racha de 5', 'Completa 5 tareas seguidas', '🔥', 50),
--   ('100 Puntos', 'Alcanza 100 puntos', '⭐', 100),
--   ('Semana Perfecta', 'Completa todas las tareas de la semana', '👑', 500);

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Ajusta las políticas RLS según tu sistema de autenticación
-- 2. Si usas Supabase Auth, cambia las políticas para usar auth.uid()
-- 3. Los recordatorios diarios se pueden implementar con:
--    - Supabase Edge Functions + Cron Jobs
--    - O un servicio externo que consulte la tabla reminders
-- 4. Considera agregar índices para mejorar el rendimiento:
--    CREATE INDEX idx_tasks_status ON tasks(status);
--    CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
--    CREATE INDEX idx_users_total_points ON users(total_points DESC);

