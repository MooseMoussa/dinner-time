# 🍽️ Dinner Time

**Multi-user dinner decision app with facial recognition and personalized recommendations**

![Platforms](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)

---

## 🎯 What It Does

Dinner Time helps you decide what to eat by providing personalized suggestions based on:
- Your dietary restrictions (vegetarian, vegan, gluten-free, etc.)
- Your cuisine preferences (Italian, Mexican, Thai, etc.)
- Whether you want to cook at home or go out
- Your location (for restaurants)
- Your cooking skill level and available ingredients (for recipes)

### Key Features

✨ **Multi-User Support** - Unlimited profiles on one device
📱 **Face Recognition** - Automatic login with offline face scanning
🍳 **Smart Suggestions** - Personalized recipe and restaurant recommendations
🌍 **Multi-Platform** - Works on iOS, Android, and Web browsers
🔒 **Privacy-First** - All data stored locally, works offline
👥 **Data Sharing** - Optionally share ingredients/equipment between users

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- For iOS: Xcode 14+ (macOS only)
- For Android: Android Studio + Android SDK
- For Web: Modern browser

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/dinner-time.git
cd dinner-time

# Install dependencies
npm install

# Initialize the database
npm run db:init
```

### Running the App

**Web (Recommended for quick start)**
```bash
npm run web
# Opens browser at http://localhost:3000
```

**iOS**
```bash
npm run ios
# Requires Mac with Xcode
```

**Android**
```bash
npm run android
# Requires Android Studio
```

**Expo (Alternative)**
```bash
npm start
# Scan QR code with Expo Go app
```

---

## 🏗️ Project Structure

```
src/
├── api/                    # API layer (UserProfile, FacialRecognition, Suggestion)
├── models/                 # Data models (9 models)
├── services/              # Core services (Database, Location, etc.)
│   └── web/              # Web-specific polyfills
├── screens/              # UI screens
├── navigation/           # Navigation configuration
├── storage/              # Database schema
└── App.tsx              # Main app entry

tests/
├── contract/            # API contract tests
├── integration/         # User flow integration tests
└── unit/               # Unit tests

web/                    # Web-specific files
├── index.html         # HTML template
└── ...
```

---

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run web` | Start web development server |
| `npm run build:web` | Build for web production |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm start` | Start Expo Metro bundler |
| `npm test` | Run all tests |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript checks |

---

## 🌐 Deployment

### Web (Netlify)

The app is configured for automatic deployment to Netlify.

Simply push to GitHub and Netlify handles the rest:

```bash
git push origin 001-make-an-app
```

Your app will be live at: **https://dinnerti-me.netlify.app**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for all platforms.

---

## 🏛️ Architecture

### Tech Stack

- **Frontend**: React Native + React Native Web
- **Language**: TypeScript
- **Navigation**: React Navigation 7
- **Database**: SQLite (mobile) / IndexedDB (web)
- **Build**: Webpack (web), Metro (mobile)

### Data Flow

```
User Input → Screens → API Layer → Services → Models → Storage
```

See [WEB_SETUP.md](./WEB_SETUP.md) for web platform details.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- Built with [React Native](https://reactnative.dev/)
- Face detection powered by react-native-face-detector
- Database by SQLite

---

**Made with ❤️ and 🍕**
