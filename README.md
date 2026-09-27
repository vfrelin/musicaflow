# 🎵 MusicaFlow - Free Music Stream PWA

Aplicación Web Progresiva (PWA) de música estilo **YouTube Music**, diseñada para reproducir audio en segundo plano (con pantalla apagada) en navegadores móviles (iOS Safari y Android Chrome), sin anuncios ni suscripciones de pago.

---

## 🌟 Características Principales

1. **Reproducción en Segundo Plano Real (iOS & Android)**:
   - Utiliza la etiqueta HTML5 `<audio>` pura vinculada a la **MediaSession API**.
   - Muestra en la pantalla de bloqueo y centro de control: **Carátula en alta definición, Nombre de canción, Artista y controles (Play, Pausa, Adelantar, Retroceder, Scrubber)**.
   - Sigue sonando con el móvil bloqueado o mientras usas otras apps (WhatsApp, Instagram, etc.).

2. **Catálogo y Búsqueda**:
   - Búsqueda en tiempo real por canción, artista, álbum o pegando una URL directa de YouTube.
   - Filtro entre canciones y videos.
   - Tendencias y éxitos en la pantalla de inicio.

3. **Playlists y Favoritos a $0**:
   - Sistema de favoritos instantáneo con corazón.
   - Crea playlists personalizadas sin registrarte.
   - Exporta e importa tus playlists en archivo JSON para no perder nada si cambias de móvil.

4. **Instalable como App Móvil (PWA)**:
   - **iPhone (Safari)**: Toca *Compartir* -> *"Añadir a la pantalla de inicio"*.
   - **Android (Chrome)**: Toca menú (3 puntos) -> *"Instalar aplicación"*.
   - Se abre en pantalla completa sin barra de navegador.

---

## 🚀 Probar Localmente en tu Móvil

1. En tu computadora, ejecuta:
   ```bash
   npm run dev
   ```
2. La terminal mostrará una dirección de red local (ejemplo: `http://192.168.1.X:3000`).
3. Abre esa dirección en el navegador de tu celular (conectado al mismo WiFi).

---

## 🌐 Cómo Montarlo en Línea 100% Gratis (Vercel)

Para tener tu enlace público como `https://tu-musica.vercel.app`:

### Opción Rápida con Vercel CLI:
```bash
npx vercel
```
*(Sigue los 3 pasos en pantalla y te dará tu enlace HTTPS gratis de por vida).*

### Opción con GitHub + Vercel:
1. Sube este proyecto a tu repositorio de GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - MusicaFlow PWA"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/musicaflow.git
   git push -u origin main
   ```
2. Entra a [vercel.com](https://vercel.com) (inicia sesión con GitHub).
3. Haz clic en **"Add New Project"** e importa tu repositorio.
4. Presiona **"Deploy"**. En 30 segundos tu app estará en línea con certificado SSL gratuito.
