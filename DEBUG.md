# 🔍 Guía de Debugging

## Si la página aparece vacía:

### 1. Abre la consola del navegador
- **Chrome/Edge**: `F12` o `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Firefox**: `F12` o `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)
- **Safari**: `Cmd+Option+C` (Mac)

### 2. Busca errores en rojo
Los errores más comunes pueden ser:

#### Error: "Failed to fetch" o "Network error"
- **Causa**: Las tablas de Supabase no existen aún
- **Solución**: Ejecuta el script `supabase-setup.sql` en Supabase

#### Error: "Cannot read property of undefined"
- **Causa**: Algún componente está intentando acceder a datos que no existen
- **Solución**: Revisa qué componente está fallando

#### Error: "Module not found"
- **Causa**: Falta alguna dependencia
- **Solución**: Ejecuta `npm install`

### 3. Verifica que el div root existe
En la consola, escribe:
```javascript
document.getElementById('root')
```
Debería devolver el elemento `<div id="root">`

### 4. Verifica las variables de entorno
En la consola, escribe:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```
Debería mostrar tu URL de Supabase

### 5. Prueba con una versión simplificada
Si quieres probar que React funciona, temporalmente cambia `src/main.jsx` a:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ padding: '20px', color: '#ECEFFF', background: '#0C083A', minHeight: '100vh' }}>
    <h1>✅ React funciona!</h1>
  </div>
)
```

Si ves el mensaje, React está funcionando y el problema está en los componentes.

### 6. Verifica que las tablas de Supabase existen
1. Ve a tu proyecto en Supabase
2. Abre "Table Editor"
3. Deberías ver las tablas: `users`, `tasks`, `reminders`, `achievements`, `user_achievements`
4. Si no existen, ejecuta el script SQL

### 7. Revisa la pestaña Network
- Abre la pestaña "Network" en las herramientas de desarrollador
- Recarga la página
- Busca requests a Supabase que fallen (código 400, 404, 500)

## Comandos útiles

```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar que Vite está corriendo
# Deberías ver: "VITE v5.x.x ready in XXX ms"
```

## Contacto
Si sigues teniendo problemas, comparte:
1. Los errores de la consola del navegador
2. Los errores del terminal donde corre `npm run dev`
3. Una captura de pantalla si es posible

