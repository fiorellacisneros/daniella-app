# ✅ Checklist Pre-Deploy Vercel

## Antes de Subir a Vercel

### 1. Base de Datos ✅
- [ ] Ejecutaste el script `supabase-setup.sql` en Supabase
- [ ] Verificaste que todas las tablas se crearon correctamente
- [ ] Habilitaste Authentication en Supabase (Email provider)

### 2. Variables de Entorno ✅
- [ ] Tienes tu `VITE_SUPABASE_URL`
- [ ] Tienes tu `VITE_SUPABASE_ANON_KEY`
- [ ] Las variables están documentadas para agregar en Vercel

### 3. Build Local ✅
- [ ] `npm run build` funciona sin errores
- [ ] La carpeta `dist` se genera correctamente
- [ ] No hay errores de linting críticos

### 4. Git Repository ✅
- [ ] Código subido a GitHub/GitLab/Bitbucket
- [ ] `.env` está en `.gitignore` (no se sube)
- [ ] `node_modules` está en `.gitignore`

### 5. Archivos de Configuración ✅
- [ ] `vercel.json` configurado
- [ ] `package.json` tiene todos los scripts necesarios
- [ ] `README.md` actualizado

## En Vercel

### 6. Configuración del Proyecto
- [ ] Proyecto creado y conectado al repositorio
- [ ] Framework detectado: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### 7. Variables de Entorno en Vercel
- [ ] `VITE_SUPABASE_URL` agregada
- [ ] `VITE_SUPABASE_ANON_KEY` agregada
- [ ] Variables configuradas para Production, Preview y Development

### 8. Primer Deploy
- [ ] Deploy iniciado
- [ ] Build completado sin errores
- [ ] URL de producción generada

### 9. Pruebas Post-Deploy
- [ ] La app carga correctamente
- [ ] Login/Registro funciona
- [ ] Conexión a Supabase funciona
- [ ] Puedes crear tareas
- [ ] El calendario muestra correctamente

## 🎯 Listo para Producción

Una vez completado todo, tu app estará lista para usar en producción.

