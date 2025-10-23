
# Implementation Plan: Dinner Decision App

**Branch**: `001-make-an-app` | **Date**: 2025-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-make-an-app/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
A multi-user dinner decision app that helps users choose what to eat based on dietary restrictions and cuisine preferences. The app supports both home cooking and restaurant recommendations, with offline facial recognition for user profile switching and optional data sharing between users on the same device. Core functionality includes personalized suggestions (up to 5 ranked options), temporary preference modification, and fallback mechanisms when matches are insufficient.

## Technical Context
**Language/Version**: NEEDS CLARIFICATION
**Primary Dependencies**: NEEDS CLARIFICATION (facial recognition library, location services, local storage)
**Storage**: Local storage for user profiles, preferences, and facial recognition data
**Testing**: NEEDS CLARIFICATION
**Target Platform**: Mobile device (iOS/Android) or cross-platform
**Project Type**: mobile - mobile app with local data storage
**Performance Goals**: <2s for facial recognition, <1s for preference matching, real-time suggestion ranking
**Constraints**: Offline facial recognition required, unlimited user profiles support, <100MB storage per user
**Scale/Scope**: Unlimited users per device, 5 suggestion algorithms, facial recognition + manual fallback

**Additional Context**: to create the implementation plan incorporating both the original dinner decision functionality and the new multi-user profile features.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: No project constitution found - using standard mobile app principles:

✅ **Single Responsibility**: Each component has a clear purpose (user profiles, facial recognition, suggestions, preferences)
✅ **Offline-First**: App functions without internet (facial recognition, preference storage)
✅ **Data Privacy**: Biometric data stored locally only, no external transmission
✅ **User Control**: Users can manually select profiles if facial recognition fails
⚠️  **Complexity**: Facial recognition + unlimited users may impact performance - needs monitoring
✅ **Testability**: Clear separation of concerns allows unit and integration testing

**Gate Result**: PASS with performance monitoring requirement

**Post-Design Re-evaluation**:
✅ **API Design**: Clear RESTful contracts with proper error handling
✅ **Data Model**: Normalized schema with appropriate constraints and indexes
✅ **Separation of Concerns**: Distinct APIs for profiles, facial recognition, and suggestions
✅ **Privacy by Design**: Biometric data stored locally only, user consent for data sharing
✅ **Testability**: Comprehensive quickstart with integration test scenarios
✅ **Performance Targets**: Specific metrics defined (2s facial recognition, 1s suggestions)
⚠️  **Complexity Management**: 3 separate APIs may need coordination layer - acceptable for feature scope

**Final Gate Result**: PASS - Design maintains constitutional principles

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->
```
src/
├── models/              # User profiles, preferences, suggestions
├── services/            # Facial recognition, location, recommendation engine
├── ui/                  # Screens and components
│   ├── profiles/       # Profile selection and management
│   ├── suggestions/    # Suggestion display and interaction
│   └── preferences/    # Preference editing
├── storage/            # Local data persistence
└── utils/              # Shared utilities

tests/
├── contract/           # API contract tests
├── integration/        # User flow tests
└── unit/              # Component and service tests
```

**Structure Decision**: Mobile app structure selected based on project type. Single codebase with cross-platform capability using local storage for user data, biometric data, and preferences. Clear separation between data models, business services, UI components, and storage layers.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Database schema tasks: Create SQLite tables with proper indexes and constraints
- Model layer tasks: Implement data entities (User Profile, Preference Profile, etc.)
- API contract test tasks: One test per endpoint in each contract [P]
- Service layer tasks: Facial recognition, location services, suggestion engine
- UI component tasks: Profile selection, suggestion display, preference editing
- Integration test tasks: Each quickstart user flow becomes a test task
- Implementation tasks to make contract and integration tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation
- Foundation first: Database setup → Models → Services → API → UI
- Dependencies: Core services before UI components
- Mark [P] for parallel execution where files are independent
- Facial recognition and suggestion engine can be developed in parallel

**Specific Task Categories**:
1. **Database Setup** (1-2 tasks): Schema creation, migration scripts
2. **Model Layer** (8-10 tasks): One task per entity + relationships [P]
3. **Contract Tests** (15-20 tasks): Test each API endpoint [P]
4. **Core Services** (8-12 tasks): Facial recognition, suggestion matching, location
5. **API Implementation** (15-20 tasks): Implement endpoints to pass contract tests
6. **UI Components** (12-15 tasks): Profile selection, suggestion display, preferences
7. **Integration Tests** (8-10 tasks): End-to-end user flows from quickstart
8. **Performance Optimization** (3-5 tasks): Meet 2s facial recognition, 1s suggestion targets

**Estimated Output**: 35-45 numbered, dependency-ordered tasks in tasks.md

**Key Dependencies**:
- Database schema → All model tasks
- User Profile model → Facial Recognition service → Profile selection UI
- Preference models → Suggestion engine → Suggestion display UI
- All APIs → Integration tests
- Core functionality → Performance optimization

**Parallel Execution Opportunities**:
- Different model entities can be implemented simultaneously [P]
- Contract tests are independent [P]
- UI components for different screens can be developed in parallel [P]
- Facial recognition and suggestion algorithm can be developed independently [P]

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
