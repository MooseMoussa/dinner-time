# Dinner Time App

A multi-user dinner decision app with facial recognition that helps users choose what to eat based on dietary restrictions and cuisine preferences.

## Features

- 🔐 **Multi-User Profiles**: Unlimited user profiles on a single device
- 📱 **Facial Recognition**: Offline facial recognition for automatic login
- 🍽️ **Smart Suggestions**: Personalized dinner recommendations
- 🏠 **Cook at Home**: Recipe suggestions based on available ingredients and skill level
- 🍕 **Restaurant Finder**: Location-based restaurant recommendations
- ⚙️ **Flexible Preferences**: Multiple dietary restrictions and cuisine preferences
- 🔄 **Temporary Changes**: Modify preferences per session with option to save
- 🔗 **Data Sharing**: Optional sharing of location, equipment, and ingredients between users

## Architecture

- **Frontend**: React Native with TypeScript
- **Database**: SQLite for local storage
- **Facial Recognition**: react-native-face-detector (offline)
- **Location**: react-native-geolocation-service
- **Testing**: Jest + React Native Testing Library + Detox

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize database**:
   ```bash
   npm run db:init
   ```

3. **Run on iOS**:
   ```bash
   npm run ios
   ```

4. **Run on Android**:
   ```bash
   npm run android
   ```

## Development

### Scripts

- `npm start` - Start Metro bundler
- `npm test` - Run all tests
- `npm run test:contract` - Run contract tests
- `npm run test:integration` - Run integration tests
- `npm run test:unit` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Project Structure

```
src/
├── models/              # Data models (UserProfile, PreferenceProfile, etc.)
├── services/            # Business logic (FacialRecognition, Suggestions, etc.)
├── ui/                  # React Native components and screens
│   ├── profiles/       # Profile selection and management
│   ├── suggestions/    # Suggestion display and interaction
│   └── preferences/    # Preference editing
├── storage/            # Database schema and utilities
└── utils/              # Shared utilities

tests/
├── contract/           # API contract tests
├── integration/        # End-to-end user flow tests
└── unit/              # Component and service unit tests
```

### Performance Targets

- ⚡ Facial recognition: <2 seconds
- 🚀 Suggestion generation: <1 second
- 💾 Storage per user: <100MB
- 👥 Support: Unlimited users per device

## API Documentation

See [API.md](./API.md) for detailed API documentation.

## Testing

The app follows Test-Driven Development (TDD):

1. **Contract Tests**: Validate API interfaces
2. **Integration Tests**: Test complete user flows
3. **Unit Tests**: Test individual components and services

Run the test suite:
```bash
npm test
```

## Contributing

1. Follow TypeScript strict mode
2. Write tests before implementation
3. Use ESLint and Prettier for code formatting
4. Update documentation for new features

## Privacy & Security

- 🔒 Facial recognition data stored locally only
- 🚫 No biometric data transmitted over network
- 👤 User consent required for data sharing
- 🗑️ Automatic cleanup of expired data