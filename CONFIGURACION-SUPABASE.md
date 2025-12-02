# ✅ Configuración de Supabase Completada

## Credenciales Configuradas

Tu proyecto ya tiene las credenciales de Supabase configuradas en el archivo `.env`:

- **URL**: `https://pwnhvjswizyiejzgaywf.supabase.co`
- **API Key**: Configurada correctamente

## ⚠️ IMPORTANTE: Configurar la Base de Datos

Antes de usar la aplicación, **debes ejecutar el script SQL** para crear las tablas necesarias:

### Pasos:

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/pwnhvjswizyiejzgaywf
2. En el menú lateral, haz clic en **"SQL Editor"**
3. Haz clic en **"New Query"**
4. Abre el archivo `supabase-setup.sql` de este proyecto
5. Copia TODO el contenido del archivo
6. Pégalo en el SQL Editor de Supabase
7. Haz clic en **"Run"** o presiona `Ctrl/Cmd + Enter`

### ¿Qué crea el script?

- ✅ Tabla `users` - Para almacenar usuarios y sus puntos
- ✅ Tabla `tasks` - Para las tareas del hogar
- ✅ Tabla `reminders` - Para los recordatorios
- ✅ Tabla `achievements` - Para los logros
- ✅ Tabla `user_achievements` - Relación usuarios-logros
- ✅ Triggers automáticos para actualizar puntos
- ✅ Políticas de seguridad (RLS)

### Verificar que funcionó:

1. Ve a **"Table Editor"** en Supabase
2. Deberías ver las 5 tablas creadas:
   - users
   - tasks
   - reminders
   - achievements
   - user_achievements

## 🚀 Siguiente Paso

Una vez que hayas ejecutado el script SQL:

```bash
npm install
npm run dev
```

La aplicación debería conectarse correctamente a Supabase.

## 🔒 Seguridad

El archivo `.env` está en `.gitignore`, así que tus credenciales no se subirán a Git. Esto es correcto y seguro.

Para producción en Vercel, necesitarás agregar estas mismas variables de entorno en la configuración del proyecto.

