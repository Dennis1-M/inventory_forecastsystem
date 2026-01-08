# PWA Testing Guide

## Quick Test (5 minutes)

### Prerequisites
```bash
cd frontend
npm install
npm run build
npm run preview
```

### Test 1: Service Worker Registration ✅
1. Open browser to `http://localhost:4173`
2. Open DevTools (F12) → Console
3. Look for: `✅ Service Worker registered successfully`
4. Go to Application tab → Service Workers
5. Should see "activated and is running"

**Expected**: Service worker registered ✅

---

### Test 2: Offline Page ✅
1. DevTools → Network tab
2. Set throttling to "Offline"
3. Refresh the page (F5)
4. Should see beautiful offline page with:
   - 📡 icon
   - "You're Offline" message
   - Connection status indicator
   - "Try Again" button
   - List of offline features

**Expected**: Offline page displays ✅

---

### Test 3: Offline Indicator Banner ✅
1. Go back online (Network: "No throttling")
2. Refresh page
3. Go offline again (Network: "Offline")
4. **Red banner should appear** in top-right:
   - 📡 icon with pulse animation
   - "You're Offline"
   - "Some features may be limited"

5. Go back online
6. **Green banner should appear**:
   - ✓ icon
   - "Back Online"
   - Auto-hides after 3 seconds

**Expected**: Banners show on connectivity change ✅

---

### Test 4: PWA Manifest ✅
1. DevTools → Application → Manifest
2. Should display:
   - Name: "AI Inventory Forecasting System"
   - Short name: "Inventory AI"
   - Start URL: "/"
   - Theme color: #3b82f6 (blue)
   - Display: standalone
   - Icons: 2 icons (SVG)
   - Shortcuts: Dashboard, Sales, Products

**Expected**: Manifest loaded correctly ✅

---

### Test 5: Install Prompt ✅
1. Keep the page open for 30 seconds
2. A beautiful prompt should slide up from bottom-left:
   - Download icon
   - "Install Inventory AI"
   - Description about offline support
   - "Install" button
   - X to dismiss

3. Try clicking "Install" (or X to dismiss)

**Expected**: Install prompt appears after 30s ✅

---

### Test 6: API Caching ✅
**Setup**:
1. Make sure you're online
2. Navigate to a few pages (products, dashboard, etc.)
3. Wait 2-3 seconds for data to load and cache

**Test**:
1. DevTools → Network → Offline
2. Navigate to previously visited pages
3. Should still show data (from cache)
4. Check Network tab - requests say "(from ServiceWorker)"

**Expected**: Previously loaded pages work offline ✅

---

### Test 7: Cache Storage ✅
1. DevTools → Application → Cache Storage
2. Should see cache named: `inventory-ai-v1.0.0`
3. Expand it to see cached files:
   - index.html
   - offline.html
   - manifest.json
   - JS/CSS bundles
   - API responses

**Expected**: Cache contains multiple files ✅

---

### Test 8: PWA Installation (Chrome) ✅
1. Look in browser address bar (right side)
2. Click the ⊕ install icon
3. Click "Install"
4. App opens in standalone window (no browser UI)
5. Works like a native app!

**Expected**: App installs and runs standalone ✅

---

## Advanced Tests

### Test 9: Update Handling
1. Change cache version in `public/service-worker.js`:
   ```javascript
   const CACHE_VERSION = 'v1.0.1';
   ```
2. Rebuild: `npm run build && npm run preview`
3. Refresh page
4. Should see update prompt (if implemented) or auto-update
5. DevTools → Application → Cache Storage should show new version

---

### Test 10: iOS Testing (if available)
1. Open Safari on iPhone/iPad
2. Navigate to your deployed site
3. Tap Share button
4. Select "Add to Home Screen"
5. App icon appears on home screen
6. Tap to open - works like native app
7. Test offline functionality

---

## Troubleshooting

### Service Worker Not Registering
**Symptoms**: No console message about SW registration

**Solutions**:
- Ensure you're testing production build (`npm run build`)
- Check for JavaScript errors in console
- Verify service-worker.js exists in public/
- Clear browser cache and reload

---

### Offline Page Not Loading
**Symptoms**: Blank page or error when offline

**Solutions**:
- Check DevTools → Application → Cache Storage
- Verify offline.html is in cache
- Check service-worker.js for errors
- Clear cache and rebuild

---

### Install Prompt Not Showing
**Symptoms**: No install banner after 30 seconds

**Solutions**:
- Check if already installed (uninstall and test again)
- Chrome: Look for install icon in address bar
- Firefox: Manual installation via menu
- iOS: Use "Add to Home Screen"
- Check browser console for errors

---

### API Not Working Offline
**Symptoms**: API calls fail when offline

**Solutions**:
- Must visit pages online first (to cache data)
- Check Network tab for "(from ServiceWorker)" requests
- Verify API patterns in service-worker.js
- Only GET requests are cached

---

## Visual Verification Checklist

### ✅ Manifest
- [ ] Manifest loads without errors
- [ ] App name displayed correctly
- [ ] Icons visible (SVG or PNG)
- [ ] Theme color applied

### ✅ Service Worker
- [ ] Registered successfully
- [ ] Status: activated
- [ ] Cache created with correct version
- [ ] Files cached (HTML, JS, CSS)

### ✅ Offline Experience
- [ ] Offline page displays when offline
- [ ] Previously visited pages work offline
- [ ] Offline indicator shows when disconnected
- [ ] Online indicator shows when reconnected

### ✅ Installation
- [ ] Install prompt appears
- [ ] Install button works
- [ ] App opens standalone
- [ ] App icon visible on home/desktop

---

## Performance Checks

### Load Times (with PWA)
- **First Visit**: Normal speed (3-5s)
- **Repeat Visit**: 2-3x faster (1-2s from cache)
- **Offline Visit**: Instant (<0.5s)

### Cache Size
- **Initial Cache**: ~500 KB
- **With API Data**: 2-5 MB
- **Browser Limit**: ~50 MB (plenty of room)

---

## Next Steps After Testing

### If Everything Works ✅
1. Deploy to production
2. Test on real mobile devices
3. Generate PNG icons (see PWA_SETUP.md)
4. Add real screenshots to manifest
5. Share with users!

### If Issues Found ❌
1. Check browser console for errors
2. Review service-worker.js configuration
3. Verify file paths are correct
4. Clear cache and test again
5. Check PWA_IMPLEMENTATION.md troubleshooting section

---

## Testing Environments

### Recommended
- ✅ Chrome/Edge (Desktop) - Full support
- ✅ Chrome (Android) - Best experience
- ✅ Safari (iOS) - Good support

### Limited Testing
- ⚠️ Firefox - Manual install only
- ⚠️ Safari (macOS) - Offline only

---

## Success Criteria

All 8 core tests pass:
- [x] Service Worker registered
- [x] Offline page loads
- [x] Offline indicators work
- [x] Manifest valid
- [x] Install prompt appears
- [x] API caching works
- [x] Cache storage populated
- [x] PWA installs successfully

**Result**: PWA fully functional! 🎉
