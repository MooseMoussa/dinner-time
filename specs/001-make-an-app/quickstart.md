# Quickstart Guide: Dinner Decision App

## Prerequisites
- Node.js 18+
- React Native CLI
- iOS Simulator (for iOS testing) or Android Studio (for Android testing)
- Device with camera capability for facial recognition testing

## Setup & Installation

### 1. Environment Setup
```bash
# Install dependencies
npm install

# iOS setup (if targeting iOS)
cd ios && pod install && cd ..

# Android setup (ensure Android SDK is configured)
npx react-native doctor
```

### 2. Database Initialization
```bash
# Initialize SQLite database with schema
npm run db:init

# Verify database setup
npm run db:verify
```

### 3. Start Development Server
```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Core User Flows Testing

### Flow 1: First-Time User Setup
**Goal**: New user creates profile and sets up facial recognition

```bash
# Test scenario
npm run test:integration -- --testNamePattern="first-time user setup"
```

**Manual Testing Steps**:
1. Launch app on fresh install
2. Tap "Create New Profile"
3. Enter name: "Test User"
4. Allow camera permissions
5. Follow facial registration prompts
6. Create first preference profile: "Quick Meals"
7. Add dietary restriction: "Vegetarian"
8. Add cuisine preference: "Italian" (level 4)
9. Complete setup

**Expected Result**: User profile created, facial data registered, default preference profile active

### Flow 2: Facial Recognition Login
**Goal**: Existing user logs in via facial recognition

```bash
# Test scenario
npm run test:integration -- --testNamePattern="facial recognition login"
```

**Manual Testing Steps**:
1. Launch app with existing user data
2. Point camera at registered user's face
3. Wait for automatic recognition
4. Verify correct profile loads

**Expected Result**: User automatically identified and logged in within 2 seconds

### Flow 3: Manual Profile Selection (Fallback)
**Goal**: User selects profile manually when facial recognition fails

```bash
# Test scenario
npm run test:integration -- --testNamePattern="manual profile selection"
```

**Manual Testing Steps**:
1. Launch app
2. Cover camera or use unregistered face
3. Observe automatic fallback to manual selection
4. Tap desired user profile from list
5. Verify profile loads correctly

**Expected Result**: Profile selection list appears, user can select manually

### Flow 4: Home Cooking Suggestions
**Goal**: User gets personalized cooking recommendations

```bash
# Test scenario
npm run test:integration -- --testNamePattern="home cooking suggestions"
```

**Manual Testing Steps**:
1. Log in as user with cooking context set up
2. Tap "Cook at Home"
3. Verify suggestions consider:
   - Dietary restrictions (vegetarian)
   - Cuisine preferences (Italian cuisine prioritized)
   - Available ingredients
   - Skill level
   - Available cooking time
4. Review 5 ranked suggestions

**Expected Result**: 5 relevant recipe suggestions matching user preferences and constraints

### Flow 5: Restaurant Suggestions
**Goal**: User gets nearby restaurant recommendations

```bash
# Test scenario
npm run test:integration -- --testNamePattern="restaurant suggestions"
```

**Manual Testing Steps**:
1. Log in as user
2. Enable location services (or set test location)
3. Tap "Go Out"
4. Verify suggestions consider:
   - Location proximity
   - Dietary restrictions
   - Cuisine preferences
5. Review restaurant details (address, rating, distance)

**Expected Result**: 5 nearby restaurants matching dietary and cuisine preferences

### Flow 6: Temporary Preference Modification
**Goal**: User modifies preferences for current session

```bash
# Test scenario
npm run test:integration -- --testNamePattern="temporary preferences"
```

**Manual Testing Steps**:
1. Log in and go to suggestion screen
2. Tap "Modify Preferences"
3. Add temporary cuisine: "Thai" (level 5)
4. Generate suggestions
5. Verify Thai cuisine appears in results
6. Complete session
7. Get prompted to save changes permanently
8. Select "No, just this time"
9. Restart app and verify original preferences restored

**Expected Result**: Temporary changes apply to session, option to save permanently

### Flow 7: Multi-User Switching
**Goal**: Different users can use same device

```bash
# Test scenario
npm run test:integration -- --testNamePattern="multi-user switching"
```

**Manual Testing Steps**:
1. Have 2 users registered on device
2. User A logs in (facial recognition)
3. User A gets suggestions
4. User B approaches camera
5. Automatic recognition switches to User B
6. Verify User B's preferences and data load
7. Test manual switching via profile selection

**Expected Result**: Seamless switching between users with their individual preferences

### Flow 8: Data Sharing Between Users
**Goal**: Users can optionally share location/equipment data

```bash
# Test scenario
npm run test:integration -- --testNamePattern="data sharing"
```

**Manual Testing Steps**:
1. Log in as User A
2. Go to Settings > Shared Data
3. Enable sharing location with User B
4. Enable sharing cooking equipment with User B
5. Switch to User B profile
6. Verify User B can access User A's shared location
7. Verify User B can access User A's equipment list
8. Confirm User B cannot see User A's dietary preferences

**Expected Result**: Granular data sharing without exposing personal preferences

## Performance Validation

### Facial Recognition Performance
```bash
# Run performance tests
npm run test:performance -- --testNamePattern="facial recognition speed"
```

**Targets**:
- Recognition time: <2 seconds
- False positive rate: <5%
- False negative rate: <10%

### Suggestion Generation Performance
```bash
# Run suggestion performance tests
npm run test:performance -- --testNamePattern="suggestion generation"
```

**Targets**:
- Suggestion generation: <1 second
- Database query time: <200ms
- UI response time: <500ms

### Storage Performance
```bash
# Run storage tests
npm run test:performance -- --testNamePattern="storage limits"
```

**Targets**:
- Support 100+ user profiles
- Storage per user: <100MB
- Database operations: <100ms p95

## Troubleshooting

### Camera Issues
```bash
# Check camera permissions
npm run debug:camera-permissions

# Test camera functionality
npm run test:camera-basic
```

### Database Issues
```bash
# Reset database
npm run db:reset

# Check database integrity
npm run db:check

# Export database for debugging
npm run db:export
```

### Performance Issues
```bash
# Profile app performance
npm run profile:performance

# Check memory usage
npm run debug:memory

# Analyze bundle size
npm run analyze:bundle
```

## Development Commands

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Lint code
npm run lint

# Type checking
npm run type-check

# Build for production
npm run build:ios
npm run build:android

# Generate API documentation
npm run docs:api

# Database migrations
npm run db:migrate
npm run db:rollback
```

## Next Steps

After verifying the quickstart flows:

1. **Run Contract Tests**: Ensure all API contracts pass
2. **Performance Testing**: Validate performance targets
3. **Security Review**: Verify biometric data encryption
4. **Accessibility Testing**: Test with screen readers and assistive technologies
5. **Device Testing**: Test on various device sizes and OS versions

## Support

- **Issues**: Check logs with `npm run logs`
- **Reset**: Full reset with `npm run reset:all`
- **Debug**: Enable debug mode with `npm run debug:enable`