# 🚀 Guía de Configuración - Daniella App

Esta guía te ayudará a configurar la aplicación para que funcione con Supabase y Vercel.

## 📋 Prerrequisitos

- Node.js 18+ instalado
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com)
- Git instalado

## 🔧 Paso 1: Configurar Supabase

### 1.1 Crear un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta o inicia sesión
2. Crea un nuevo proyecto
3. Anota la **URL** y la **anon key** de tu proyecto (Settings > API)

### 1.2 Configurar la base de datos

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido del archivo `supabase-setup.sql`
3. Ejecuta el script completo
4. Verifica que las tablas se hayan creado correctamente (ve a **Table Editor**)

### 1.3 (Opcional) Configurar autenticación

Si quieres usar autenticación de Supabase:

1. Ve a **Authentication > Providers**
2. Habilita los proveedores que necesites (Email, Google, etc.)
3. Ajusta las políticas RLS en las tablas según tus necesidades

## 🔧 Paso 2: Configurar el proyecto local

### 2.1 Instalar dependencias

```bash
npm install
```

### 2.2 Configurar variables de entorno

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` y agrega tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 2.3 Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación debería abrirse en `http://localhost:3000`

## 🚀 Paso 3: Deploy en Vercel

### 3.1 Preparar el proyecto

1. Asegúrate de que tu código esté en un repositorio Git (GitHub, GitLab, etc.)

### 3.2 Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta o inicia sesión
2. Haz clic en **"New Project"**
3. Importa tu repositorio de Git
4. Vercel detectará automáticamente que es un proyecto Vite

### 3.3 Configurar variables de entorno en Vercel

1. En la configuración del proyecto, ve a **Settings > Environment Variables**
2. Agrega las siguientes variables:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key de Supabase

### 3.4 Deploy

1. Haz clic en **Deploy**
2. Espera a que se complete el build
3. Tu aplicación estará disponible en una URL de Vercel

## 📱 Paso 4: Configurar Recordatorios Diarios

Para los recordatorios diarios, tienes dos opciones:

### Opción 1: Supabase Edge Functions + Cron

1. Crea una Edge Function en Supabase:
```bash
supabase functions new send-reminders
```

2. Implementa la lógica para enviar recordatorios
3. Configura un cron job en Supabase Dashboard

### Opción 2: Servicio externo

Usa un servicio como:
- [Cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- O un servidor propio que consulte la API de Supabase

## 🎨 Personalización

### Cambiar colores

Edita `src/index.css` y modifica las variables CSS:
```css
:root {
  --bg-primary: #0C083A;
  --button-primary: #492AAC;
  --text-color: #ECEFFF;
  --glass-card: #454368;
}
```

### Agregar más categorías

Edita `src/pages/Tasks.jsx` y modifica el array `categories`:
```javascript
const [categories] = useState([
  'Cocina',
  'Limpieza',
  // ... agrega más aquí
])
```

## 🐛 Solución de Problemas

### Error: "Supabase credentials not found"
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo después de crear/modificar `.env`

### Error: "relation does not exist"
- Asegúrate de haber ejecutado el script SQL en Supabase
- Verifica que las tablas se crearon correctamente

### La aplicación no carga en Vercel
- Verifica que las variables de entorno estén configuradas en Vercel
- Revisa los logs de build en Vercel para ver errores

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Ant Design](https://ant.design)
- [Documentación de React](https://react.dev)

## 🆘 Soporte

Si tienes problemas, verifica:
1. Que todas las dependencias estén instaladas
2. Que las variables de entorno estén correctamente configuradas
3. Que la base de datos esté configurada correctamente
4. Los logs de la consola del navegador y del servidor

