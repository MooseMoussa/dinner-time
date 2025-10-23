# 🚀 Deployment Guide

Complete guide for deploying Dinner Time to production.

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] TypeScript checks passing (`npm run type-check`)
- [ ] Linting passing (`npm run lint`)
- [ ] No console.log statements in production code
- [ ] Environment variables configured

### Build Verification
- [ ] Web build successful (`npm run build:web`)
- [ ] iOS build successful (if deploying to App Store)
- [ ] Android build successful (if deploying to Play Store)

### Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md updated with version notes
- [ ] API documentation complete

---

## 🌐 Web Deployment (Netlify)

### Option 1: Automatic Deployment (Recommended)

**Setup (One Time)**

1. **Push code to GitHub**
   ```bash
   git push origin 001-make-an-app
   ```

2. **Connect to Netlify**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Authorize GitHub
   - Select repository: `dinner-time`
   - Branch: `001-make-an-app`

3. **Configure Build**
   Netlify auto-detects settings from `netlify.toml`:
   ```toml
   [build]
     publish = "web-build"
     command = "npm run build:web"
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify builds and deploys automatically
   - Get your URL: `https://dinnerti-me.netlify.app`

**Future Deployments**
- Simply push to GitHub
- Netlify rebuilds automatically on every push

### Option 2: Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build:web

# Deploy
netlify deploy --prod --dir=web-build
```

### Custom Domain Setup

1. Go to Netlify dashboard → Domain settings
2. Click "Add custom domain"
3. Enter your domain: `dinnertime.com`
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Let's Encrypt)

---

## 📱 iOS Deployment (App Store)

### Prerequisites
- Apple Developer Account ($99/year)
- Mac with Xcode 14+
- Valid signing certificates

### Steps

1. **Configure App**
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Update Info.plist**
   - Set app name, version, bundle ID
   - Add camera/location permissions descriptions

3. **Build for Release**
   ```bash
   npx react-native run-ios --configuration Release
   ```

4. **Archive in Xcode**
   - Open `ios/DinnerTime.xcworkspace` in Xcode
   - Product → Archive
   - Distribute App → App Store Connect
   - Upload to App Store Connect

5. **Submit for Review**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Fill in app information, screenshots
   - Submit for review

**Expected Timeline**: 1-3 days for review

---

## 🤖 Android Deployment (Google Play)

### Prerequisites
- Google Play Developer Account ($25 one-time)
- Android Studio
- Valid signing key

### Steps

1. **Generate Signing Key**
   ```bash
   cd android/app
   keytool -genkeypair -v -storetype PKCS12 -keystore dinner-time-release.keystore \
     -alias dinner-time -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Gradle**
   Edit `android/app/build.gradle`:
   ```gradle
   signingConfigs {
     release {
       storeFile file('dinner-time-release.keystore')
       storePassword 'YOUR_PASSWORD'
       keyAlias 'dinner-time'
       keyPassword 'YOUR_PASSWORD'
     }
   }
   ```

3. **Build Release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

   Output: `android/app/build/outputs/apk/release/app-release.apk`

4. **Or Build AAB (Recommended)**
   ```bash
   ./gradlew bundleRelease
   ```

   Output: `android/app/build/outputs/bundle/release/app-release.aab`

5. **Upload to Play Console**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create app listing
   - Upload AAB file
   - Fill in store listing, screenshots
   - Submit for review

**Expected Timeline**: 1-7 days for review

---

## 🔐 Environment Variables

### Web (.env.production)
```bash
REACT_APP_API_URL=https://api.dinnertime.com
REACT_APP_VERSION=1.0.0
```

### Mobile (ios/Config.xcconfig, android/gradle.properties)
```
API_URL=https://api.dinnertime.com
VERSION_NAME=1.0.0
VERSION_CODE=1
```

---

## 📊 Monitoring & Analytics

### Web Analytics (Recommended: Google Analytics)

1. Add to `web/index.html`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
   ```

2. Track events:
   ```typescript
   // Track user actions
   gtag('event', 'suggestion_request', {
     source: 'cook_at_home'
   });
   ```

### Error Tracking (Recommended: Sentry)

```bash
npm install @sentry/react-native

# Initialize in App.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
});
```

### Performance Monitoring

Built-in with `PerformanceOptimizer.ts`:
- Tracks API response times
- Monitors facial recognition performance
- Logs slow database queries

---

## 🔄 CI/CD Pipeline (Optional but Recommended)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main, 001-make-an-app]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npm run type-check
      - run: npm run lint

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build:web
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=web-build
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📦 Version Management

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Tagging Releases

```bash
# Update version in package.json
npm version patch  # or minor, or major

# Create git tag
git tag -a v1.0.1 -m "Release version 1.0.1"
git push origin v1.0.1

# GitHub will create a release automatically
```

---

## 🐛 Rollback Procedure

### Web (Netlify)
1. Go to Netlify dashboard
2. Deploys → Click on previous successful deploy
3. Click "Publish deploy"

### Mobile
- Cannot rollback published apps
- Must release new version with fix
- Use phased rollout to limit impact

---

## 📈 Post-Deployment

### Verification
- [ ] Test on production URL
- [ ] Verify all features work
- [ ] Check analytics tracking
- [ ] Monitor error rates
- [ ] Test on multiple devices/browsers

### Monitoring
- Check Netlify analytics
- Monitor Sentry for errors
- Review user feedback
- Track performance metrics

### Communication
- Announce release on social media
- Update documentation
- Notify beta testers
- Send update to users (if applicable)

---

## 🚨 Emergency Hotfix

```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug main

# Fix the bug
# ... make changes ...

# Test
npm test

# Commit and push
git commit -m "fix: critical bug in user login"
git push origin hotfix/critical-bug

# Deploy immediately
# (Netlify auto-deploys on push)

# Merge back to main
git checkout main
git merge hotfix/critical-bug
git push origin main
```

---

## 📞 Support

If you encounter deployment issues:

1. Check build logs in Netlify/CI
2. Verify environment variables
3. Test local production build first
4. Review [Troubleshooting Guide](./TROUBLESHOOTING.md)
5. Open an issue on GitHub

---

**Last Updated**: 2025-10-23
