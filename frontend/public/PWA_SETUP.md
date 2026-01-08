# PWA Implementation Guide

This document explains how to convert SVG icons to PNG for the PWA manifest.

## Quick Start

The app uses SVG icons by default. To generate proper PNG icons:

### Option 1: Use Online Converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon-192x192.svg` and convert to PNG (192x192)
3. Upload `icon-512x512.svg` and convert to PNG (512x512)
4. Save both as `icon-192x192.png` and `icon-512x512.png` in the `public/` folder

### Option 2: Use ImageMagick (if installed)
```bash
cd frontend/public
convert -background none -size 192x192 icon-192x192.svg icon-192x192.png
convert -background none -size 512x512 icon-512x512.svg icon-512x512.png
```

### Option 3: Use Node.js Script
```bash
npm install -D sharp
node scripts/generate-icons.js
```

## Temporary Fallback

The manifest.json currently references PNG files. If you haven't generated them yet, the service worker will continue to work, but the icons won't display properly when installing the PWA.

## Testing PWA

1. Build the production app: `npm run build`
2. Preview the build: `npm run preview`
3. Open Chrome DevTools > Application > Manifest
4. Check "Service Workers" tab to verify registration
5. Click "Install" to test PWA installation

## PWA Features Implemented

✅ Service Worker for offline caching
✅ Web App Manifest with metadata
✅ Offline indicator component
✅ Install prompt component
✅ Cache-first strategy for static assets
✅ Network-first strategy for API calls
✅ Offline fallback page
✅ iOS PWA support
✅ Android PWA support

## Caching Strategy

- **Static Assets**: Cache-first (HTML, CSS, JS, images)
- **API Calls**: Network-first with cache fallback
- **Offline Page**: Served when navigation fails while offline

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Partial support (no install prompt)
- Safari (iOS): ✅ Add to Home Screen
- Safari (macOS): ⚠️ Limited support
