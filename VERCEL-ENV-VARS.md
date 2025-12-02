# 🔧 Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: Configurar Variables de Entorno

El error que estás viendo significa que las variables de entorno no están configuradas en Vercel.

## 📝 Pasos para Agregar Variables de Entorno

### 1. Ve a tu Proyecto en Vercel

1. Inicia sesión en [vercel.com](https://vercel.com)
2. Selecciona tu proyecto `daniella-app`
3. Ve a **Settings** (Configuración)
4. En el menú lateral, haz clic en **Environment Variables**

### 2. Agrega las Variables

Haz clic en **"Add New"** y agrega cada variable:

#### Variable 1:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://pwnhvjswizyiejzgaywf.supabase.co`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 2:
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bmh2anN3aXp5aWVqemdheXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NDMxMzIsImV4cCI6MjA4MDIxOTEzMn0.tThGZ5VKXWXNNEwuS_c2UdSOM7eVmH_BPFLc7o45QUU`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 3. Guarda y Redespliega

1. Haz clic en **"Save"** para cada variable
2. Ve a la pestaña **Deployments**
3. Haz clic en los **3 puntos** del último deployment
4. Selecciona **"Redeploy"**
5. O simplemente haz un nuevo commit y push (Vercel redeployará automáticamente)

## 🔍 Verificar que Funcionó

Después del redeploy:

1. Abre tu app en Vercel
2. Abre la consola del navegador (F12)
3. No deberías ver el error de "Supabase credentials not found"
4. Deberías poder hacer login/registro

## 🐛 Si Sigue Sin Funcionar

### Verifica en Vercel:

1. Ve a **Settings > Environment Variables**
2. Confirma que las variables están ahí
3. Verifica que están habilitadas para **Production**

### Verifica el Build:

1. Ve a **Deployments**
2. Haz clic en el último deployment
3. Revisa los **Build Logs**
4. Busca si hay errores relacionados con las variables

### Verifica en el Código:

Las variables deben empezar con `VITE_` para que Vite las incluya en el build.

## 📸 Captura de Pantalla de Referencia

En Vercel, deberías ver algo así:

```
Environment Variables
┌─────────────────────────┬─────────────────────────────────────┬──────────────┐
│ Name                    │ Value                                │ Environments │
├─────────────────────────┼─────────────────────────────────────┼──────────────┤
│ VITE_SUPABASE_URL       │ https://pwnhvjswizyiejzgaywf...     │ All          │
│ VITE_SUPABASE_ANON_KEY  │ eyJhbGciOiJIUzI1NiIsInR5cCI6...     │ All          │
└─────────────────────────┴─────────────────────────────────────┴──────────────┘
```

## ✅ Checklist

- [ ] Variables agregadas en Vercel
- [ ] Variables habilitadas para Production, Preview y Development
- [ ] Deployment redeployado después de agregar variables
- [ ] Error desapareció en la consola
- [ ] La app se conecta a Supabase correctamente

