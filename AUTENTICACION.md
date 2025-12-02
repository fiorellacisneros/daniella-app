# 🔐 Sistema de Autenticación

## Estado Actual

La aplicación ahora tiene **autenticación completa** con Supabase Auth.

## ✅ Lo que está implementado:

1. **Página de Login/Registro**
   - Iniciar sesión con email y contraseña
   - Registrarse con nombre, email y contraseña
   - Validación de formularios

2. **Integración con Supabase Auth**
   - Autenticación segura
   - Sesiones persistentes
   - Protección de rutas

3. **Base de Datos Actualizada**
   - Campo `auth_user_id` agregado a la tabla `users`
   - Vincula usuarios de Auth con la tabla users

## 🚀 Configuración en Supabase

### 1. Habilitar Autenticación por Email

1. Ve a tu proyecto en Supabase
2. Ve a **Authentication > Providers**
3. Asegúrate de que **Email** esté habilitado
4. (Opcional) Configura la plantilla de email de confirmación

### 2. Ejecutar el Script SQL Actualizado

El script `supabase-setup.sql` ya incluye el campo `auth_user_id`. Solo necesitas ejecutarlo.

### 3. Configurar Políticas RLS (Opcional pero Recomendado)

Si quieres que cada usuario solo vea sus propios datos, actualiza las políticas:

```sql
-- Política para users: solo ver/editar tu propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = auth_user_id::text);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = auth_user_id::text);

-- Política para tasks: solo ver tus propias tareas
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (
    created_by IN (
      SELECT id FROM users WHERE auth_user_id::text = auth.uid()::text
    )
  );
```

## 📱 Flujo de la Aplicación

1. **Primera vez**: Usuario ve pantalla de Login
2. **Registro**: Crea cuenta con email/contraseña
3. **Onboarding**: Si es nuevo, configura nombre y tareas
4. **Dashboard**: Accede a la aplicación

## 🔄 Cerrar Sesión

Para agregar un botón de cerrar sesión, puedes usar:

```javascript
const handleLogout = async () => {
  await supabase.auth.signOut()
  window.location.reload()
}
```

## 💡 Notas

- Las sesiones se mantienen entre recargas
- Si el usuario cierra sesión, vuelve a la pantalla de login
- Cada usuario tiene su propio perfil y puntos

