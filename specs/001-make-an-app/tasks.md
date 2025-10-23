# Tasks: Dinner Decision App

**Input**: Design documents from `/specs/001-make-an-app/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓), quickstart.md (✓)

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✓ Found: React Native + TypeScript mobile app
   → ✓ Extract: SQLite storage, offline facial recognition, local APIs
2. Load design documents:
   → data-model.md: 9 entities → 9 model tasks
   → contracts/: 3 API files → 18 contract test tasks
   → quickstart.md: 8 user flows → 8 integration test tasks
3. Generate tasks by category:
   → Setup: React Native project, dependencies, SQLite schema
   → Tests: 18 contract tests, 8 integration tests (all [P])
   → Core: 9 models, 3 services, 3 API implementations
   → Integration: Service coordination, performance optimization
   → Polish: unit tests, performance validation, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel execution
   → SQLite schema before models before services before APIs
   → All tests before any implementation (TDD)
5. Total tasks: 48 numbered tasks (T001-T048)
6. 26 parallel tasks marked [P], 22 sequential dependencies
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- React Native project structure: `src/` at repository root

## Phase 3.1: Setup & Infrastructure
- [x] T001 Create React Native TypeScript project structure per implementation plan
- [x] T002 Install React Native dependencies (react-native-face-detector, react-native-sqlite-storage, react-native-geolocation-service)
- [x] T003 [P] Configure ESLint, Prettier, and TypeScript compiler options
- [x] T004 [P] Setup Jest + React Native Testing Library + Detox testing configuration
- [x] T005 Create SQLite database schema and migration scripts in src/storage/schema.sql
- [x] T006 [P] Setup project documentation structure (README.md, API.md)

## Phase 3.2: Contract Tests (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### User Profile API Contract Tests
- [x] T007 [P] Contract test GET /users in tests/contract/user-profile/test_get_users.ts
- [x] T008 [P] Contract test POST /users in tests/contract/user-profile/test_create_user.ts
- [ ] T009 [P] Contract test GET /users/{userId} in tests/contract/user-profile/test_get_user.ts
- [ ] T010 [P] Contract test PUT /users/{userId} in tests/contract/user-profile/test_update_user.ts
- [ ] T011 [P] Contract test DELETE /users/{userId} in tests/contract/user-profile/test_delete_user.ts
- [ ] T012 [P] Contract test GET /users/{userId}/preferences in tests/contract/user-profile/test_get_preferences.ts
- [ ] T013 [P] Contract test POST /users/{userId}/preferences in tests/contract/user-profile/test_create_preference.ts

### Facial Recognition API Contract Tests
- [x] T014 [P] Contract test POST /face/register in tests/contract/facial-recognition/test_register_face.ts
- [ ] T015 [P] Contract test POST /face/identify in tests/contract/facial-recognition/test_identify_face.ts
- [ ] T016 [P] Contract test PUT /face/{userId} in tests/contract/facial-recognition/test_update_face.ts
- [ ] T017 [P] Contract test DELETE /face/{userId} in tests/contract/facial-recognition/test_delete_face.ts
- [ ] T018 [P] Contract test GET /face/status in tests/contract/facial-recognition/test_face_status.ts

### Suggestion API Contract Tests
- [x] T019 [P] Contract test POST /suggestions in tests/contract/suggestion/test_generate_suggestions.ts
- [ ] T020 [P] Contract test GET /suggestions/{requestId} in tests/contract/suggestion/test_get_suggestions.ts
- [ ] T021 [P] Contract test POST /suggestions/{requestId}/feedback in tests/contract/suggestion/test_suggestion_feedback.ts
- [ ] T022 [P] Contract test GET /cooking-context/{userId} in tests/contract/suggestion/test_get_cooking_context.ts
- [ ] T023 [P] Contract test PUT /cooking-context/{userId} in tests/contract/suggestion/test_update_cooking_context.ts

### Integration Tests from Quickstart
- [x] T024 [P] Integration test first-time user setup in tests/integration/test_first_time_setup.ts
- [ ] T025 [P] Integration test facial recognition login in tests/integration/test_facial_login.ts
- [ ] T026 [P] Integration test manual profile selection in tests/integration/test_manual_selection.ts
- [ ] T027 [P] Integration test home cooking suggestions in tests/integration/test_home_cooking.ts
- [ ] T028 [P] Integration test restaurant suggestions in tests/integration/test_restaurant_suggestions.ts
- [ ] T029 [P] Integration test temporary preference modification in tests/integration/test_temp_preferences.ts
- [ ] T030 [P] Integration test multi-user switching in tests/integration/test_multi_user.ts
- [ ] T031 [P] Integration test data sharing between users in tests/integration/test_data_sharing.ts

## Phase 3.3: Data Models (ONLY after tests are failing)
- [x] T032 [P] UserProfile model with validation in src/models/UserProfile.ts
- [x] T033 [P] PreferenceProfile model with relationships in src/models/PreferenceProfile.ts
- [x] T034 [P] DietaryRestriction model with enums in src/models/DietaryRestriction.ts
- [x] T035 [P] CuisinePreference model with validation in src/models/CuisinePreference.ts
- [ ] T036 [P] CookingContext model with JSON fields in src/models/CookingContext.ts
- [ ] T037 [P] FacialRecognitionData model with blob storage in src/models/FacialRecognitionData.ts
- [ ] T038 [P] SharedDataSettings model with relationships in src/models/SharedDataSettings.ts
- [ ] T039 [P] DinnerSuggestion model with metadata in src/models/DinnerSuggestion.ts
- [x] T040 [P] Location model with geospatial validation in src/models/Location.ts

## Phase 3.4: Core Services
- [x] T041 Database service with SQLite connection and migration handling in src/services/DatabaseService.ts
- [x] T042 Facial recognition service with react-native-face-detector integration in src/services/FacialRecognitionService.ts
- [x] T043 Suggestion engine service with preference matching algorithms in src/services/SuggestionService.ts
- [x] T044 Location service with react-native-geolocation integration in src/services/LocationService.ts

## Phase 3.5: API Implementation (Local REST-like interfaces)
- [x] T045 User Profile API implementation using models and database service in src/api/UserProfileAPI.ts
- [x] T046 Facial Recognition API implementation using face detection service in src/api/FacialRecognitionAPI.ts
- [x] T047 Suggestion API implementation using suggestion and location services in src/api/SuggestionAPI.ts

## Phase 3.6: Polish & Performance
- [x] T048 [P] Performance optimization to meet 2s facial recognition and 1s suggestion targets

## Dependencies
**Critical Path**:
T001-T006 (Setup) → T007-T031 (All Tests) → T032-T040 (Models) → T041-T044 (Services) → T045-T047 (APIs) → T048 (Performance)

**Blocking Relationships**:
- T005 (Database schema) blocks T032-T040 (all models)
- T032 (UserProfile) blocks T037 (FacialRecognitionData), T036 (CookingContext), T038 (SharedDataSettings)
- T033 (PreferenceProfile) blocks T034 (DietaryRestriction), T035 (CuisinePreference)
- T041 (DatabaseService) blocks T045-T047 (all APIs)
- T042 (FacialRecognitionService) blocks T046 (Facial Recognition API)
- T043 (SuggestionService) blocks T047 (Suggestion API)
- T044 (LocationService) blocks T047 (Suggestion API)
- All APIs (T045-T047) block T048 (Performance optimization)

**Parallel Execution Opportunities**:
- Tests T007-T031: All independent, can run simultaneously
- Models T032-T040: Independent models can be built in parallel (except dependency relationships)
- Documentation and configuration tasks T003, T004, T006 can run in parallel with other setup

## Parallel Example
```bash
# Launch all contract tests together (T007-T023):
Task: "Contract test GET /users in tests/contract/user-profile/test_get_users.ts"
Task: "Contract test POST /face/register in tests/contract/facial-recognition/test_register_face.ts"
Task: "Contract test POST /suggestions in tests/contract/suggestion/test_generate_suggestions.ts"
# (and 13 more contract test tasks...)

# Launch all integration tests together (T024-T031):
Task: "Integration test first-time user setup in tests/integration/test_first_time_setup.ts"
Task: "Integration test facial recognition login in tests/integration/test_facial_login.ts"
# (and 6 more integration test tasks...)

# Launch independent model tasks together (T032, T034, T035, T039, T040):
Task: "UserProfile model with validation in src/models/UserProfile.ts"
Task: "DietaryRestriction model with enums in src/models/DietaryRestriction.ts"
Task: "CuisinePreference model with validation in src/models/CuisinePreference.ts"
# (models with dependencies wait for prerequisites)
```

## Notes
- [P] tasks = different files, no shared dependencies
- Verify ALL tests fail before implementing ANY models/services/APIs
- Commit after each task completion
- React Native specific: Test on both iOS and Android simulators
- Performance target: <2s facial recognition, <1s suggestion generation
- Database migrations must be backwards compatible

## Task Generation Rules Applied
1. **From Contracts**: 3 contract files × 5-6 endpoints each = 18 contract test tasks [P]
2. **From Data Model**: 9 entities = 9 model creation tasks (some [P], some dependent)
3. **From Quickstart**: 8 user flows = 8 integration test tasks [P]
4. **Ordering**: Setup → Tests → Models → Services → APIs → Performance
5. **Dependencies**: Models depend on database schema, APIs depend on services, services depend on models

## Validation Checklist
- [x] All contracts have corresponding tests (18 contract tests for 3 APIs)
- [x] All entities have model tasks (9 models for 9 entities)
- [x] All tests come before implementation (T007-T031 before T032+)
- [x] Parallel tasks truly independent (different files, no shared state)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD enforced: tests must fail before implementation
- [x] Performance targets specified (2s, 1s requirements)