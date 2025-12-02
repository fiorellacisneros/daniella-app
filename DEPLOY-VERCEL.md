# 🚀 Guía de Deploy en Vercel

## ✅ Pre-requisitos Completados

- ✅ Build funciona correctamente (`npm run build`)
- ✅ Configuración de Vercel lista (`vercel.json`)
- ✅ Variables de entorno documentadas

## 📋 Pasos para Deploy

### Opción 1: Deploy desde GitHub/GitLab (Recomendado)

1. **Sube tu código a un repositorio Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <tu-repositorio-url>
   git push -u origin main
   ```

2. **Conecta con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión o crea una cuenta
   - Haz clic en **"Add New Project"**
   - Importa tu repositorio de GitHub/GitLab
   - Vercel detectará automáticamente que es un proyecto Vite

3. **Configura las Variables de Entorno**
   - En la configuración del proyecto, ve a **Settings > Environment Variables**
   - Agrega las siguientes variables:
     ```
     VITE_SUPABASE_URL=https://pwnhvjswizyiejzgaywf.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bmh2anN3aXp5aWVqemdheXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NDMxMzIsImV4cCI6MjA4MDIxOTEzMn0.tThGZ5VKXWXNNEwuS_c2UdSOM7eVmH_BPFLc7o45QUU
     ```
   - Asegúrate de seleccionar **Production**, **Preview**, y **Development**

4. **Deploy**
   - Haz clic en **"Deploy"**
   - Espera a que se complete el build (2-3 minutos)
   - ¡Tu app estará lista!

### Opción 2: Deploy desde CLI

1. **Instala Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Inicia sesión**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Sigue las instrucciones:
   - ¿Set up and deploy? **Yes**
   - ¿Which scope? (selecciona tu cuenta)
   - ¿Link to existing project? **No**
   - ¿What's your project's name? **daniella-app** (o el que prefieras)
   - ¿In which directory is your code located? **./**

4. **Agrega variables de entorno**
   ```bash
   vercel env add VITE_SUPABASE_URL
   # Pega: https://pwnhvjswizyiejzgaywf.supabase.co
   
   vercel env add VITE_SUPABASE_ANON_KEY
   # Pega: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bmh2anN3aXp5aWVqemdheXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NDMxMzIsImV4cCI6MjA4MDIxOTEzMn0.tThGZ5VKXWXNNEwuS_c2UdSOM7eVmH_BPFLc7o45QUU
   ```

5. **Deploy a producción**
   ```bash
   vercel --prod
   ```

## ⚙️ Configuración Automática

Vercel detectará automáticamente:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ Node Version: 18.x (o superior)

## 🔧 Verificación Post-Deploy

1. **Verifica que la app carga correctamente**
2. **Prueba el login/registro**
3. **Verifica que se conecta a Supabase**
4. **Prueba crear una tarea**

## 📝 Notas Importantes

- **Variables de Entorno**: Asegúrate de agregarlas en Vercel antes del primer deploy
- **Base de Datos**: Ejecuta el script SQL en Supabase antes de usar la app
- **Dominio Personalizado**: Puedes agregar un dominio personalizado en Settings > Domains
- **Build Warnings**: El warning sobre el tamaño del chunk es normal para apps con Ant Design

## 🐛 Solución de Problemas

### Error: "Environment variables not found"
- Verifica que agregaste las variables en Vercel
- Asegúrate de que están en Production, Preview y Development

### Error: "Build failed"
- Revisa los logs en Vercel Dashboard
- Verifica que `package.json` tiene todas las dependencias
- Asegúrate de que el build funciona localmente (`npm run build`)

### La app carga pero no se conecta a Supabase
- Verifica las variables de entorno en Vercel
- Revisa la consola del navegador para errores
- Asegúrate de que ejecutaste el script SQL en Supabase

## 🎉 ¡Listo!

Una vez deployado, tendrás una URL como:
`https://daniella-app.vercel.app`

¡Tu aplicación estará en producción! 🚀

