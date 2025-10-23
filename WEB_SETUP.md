# React Native Web Setup

This project now supports **both mobile (iOS/Android) and web** platforms.

## Running the App

### Mobile (iOS/Android)
```bash
# iOS (requires Mac with Xcode)
npm run ios

# Android (requires Android Studio)
npm run android

# Start Metro bundler
npm start
```

### Web
```bash
# Development server (opens browser automatically)
npm run web

# Production build
npm run build:web

# Output: web-build/ directory
```

## How It Works

### Architecture
- **React Native** code runs on mobile
- **React Native Web** translates React Native components to HTML/CSS for web
- Platform-specific modules use polyfills for web

### Web Polyfills
Located in `src/services/web/`:

- **SQLiteWeb.ts** - Uses IndexedDB instead of SQLite
- **GeolocationWeb.ts** - Uses browser Geolocation API
- **FaceDetectorWeb.ts** - Placeholder for web face detection

### Build Configuration
- **webpack.config.js** - Web build configuration
- **index.web.js** - Web entry point
- **web/index.html** - HTML template
- **netlify.toml** - Netlify deployment config

## Deployment

### Netlify (Automatic)
1. Push code to GitHub
2. Connect repository to Netlify
3. Netlify automatically runs `npm run build:web`
4. Deploys to dinnerti-me.netlify.app

### Manual Build
```bash
npm run build:web
# Upload web-build/ folder to any static host
```

## Platform Differences

### Features Available on Both
- ✅ User profiles and preferences
- ✅ Suggestion engine
- ✅ Location services
- ✅ All UI components

### Mobile-Only Features
- 📱 Native SQLite database (web uses IndexedDB)
- 📱 Full facial recognition (web has limited support)
- 📱 Better camera access

### Web-Only Features
- 🌐 No app installation required
- 🌐 Works on any device with a browser
- 🌐 Easier testing and development

## Next Steps

The web platform is configured. Now implementing:
1. Missing data models
2. Remaining tests
3. Full UI with navigation and screens
4. Camera integration (mobile) / file upload (web)
