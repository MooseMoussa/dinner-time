# Data Model: Dinner Decision App

## Entity Relationships

```
User Profile (1) ──── (N) Preference Profile
     │
     │ (1)
     │
     └─── (1) Facial Recognition Data

User Profile (N) ──── (N) Shared Data Settings

Preference Profile (1) ──── (N) Dietary Restriction
                   (1) ──── (N) Cuisine Preference

Cooking Context (1) ──── (1) User Profile

Suggestion Request (1) ──── (N) Dinner Suggestion
                   (1) ──── (1) User Profile
```

## Core Entities

### User Profile
**Purpose**: Represents an individual user on the shared device
**Primary Key**: user_id (UUID)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| user_id | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| name | String | NOT NULL, max 50 chars | Display name for profile selection |
| created_at | DateTime | NOT NULL | Profile creation timestamp |
| last_used | DateTime | NOT NULL | Last access time for cleanup |
| is_active | Boolean | NOT NULL, default true | Soft delete flag |
| location_lat | Float | nullable | Current latitude |
| location_lng | Float | nullable | Current longitude |
| location_updated | DateTime | nullable | Last location update |

**Validation Rules**:
- Name must be unique per device
- Location coordinates must be valid ranges (-90/90, -180/180)
- last_used updated on every profile access

### Preference Profile
**Purpose**: Named collection of dietary and cuisine preferences
**Primary Key**: profile_id (UUID)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| profile_id | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| user_id | UUID | FOREIGN KEY, NOT NULL | Owner user |
| name | String | NOT NULL, max 30 chars | Profile name (e.g., "Weekday Quick") |
| is_default | Boolean | NOT NULL, default false | Default profile for user |
| created_at | DateTime | NOT NULL | Creation timestamp |

**Validation Rules**:
- Each user can have only one default profile
- Profile names must be unique per user
- At least one profile required per user

### Dietary Restriction
**Purpose**: Individual dietary limitations
**Primary Key**: restriction_id (UUID)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| restriction_id | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| profile_id | UUID | FOREIGN KEY, NOT NULL | Associated preference profile |
| type | Enum | NOT NULL | Restriction type |
| custom_name | String | nullable, max 30 chars | Custom restriction name |

**Enum Values for type**:
- vegetarian, vegan, gluten_free, dairy_free, nut_allergy, shellfish_allergy, kosher, halal, custom

**Validation Rules**:
- If type = custom, custom_name is required
- No duplicate restrictions per profile

### Cuisine Preference
**Purpose**: Individual cuisine preferences
**Primary Key**: preference_id (UUID)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| preference_id | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| profile_id | UUID | FOREIGN KEY, NOT NULL | Associated preference profile |
| cuisine_type | Enum | NOT NULL | Cuisine type |
| preference_level | Integer | NOT NULL, 1-5 | Preference strength (1=dislike, 5=love) |

**Enum Values for cuisine_type**:
- italian, mexican, chinese, japanese, thai, indian, french, american, mediterranean, middle_eastern, korean, vietnamese, greek, spanish, german, british, african, caribbean

**Validation Rules**:
- No duplicate cuisine types per profile
- preference_level must be 1-5

### Cooking Context
**Purpose**: User's cooking capabilities and constraints
**Primary Key**: context_id (UUID)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| context_id | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| user_id | UUID | FOREIGN KEY UNIQUE, NOT NULL | One-to-one with user |
| skill_level | Enum | NOT NULL | Cooking skill |
| available_time | Integer | NOT NULL, > 0 | Minutes available for cooking |
| equipment_list | JSON | NOT NULL | Available cooking equipment |
| ingredients_list | JSON | NOT NULL | Available ingredients |
| updated_at | DateTime | NOT NULL | Last update timestamp |

**Enum Values for skill_level**:
- beginner, intermediate, advanced, expert

**JSON Schema for equipment_list**:
```json
{
  "type": "array",
  "items": {
    "type": "string",
    "enum": ["stove", "oven", "microwave", "air_fryer", "slow_cooker", "pressure_cooker", "grill", "toaster", "blender", "food_processor"]
  }
}
```

**JSON Schema for ingredients_list**:
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "name": {"type": "string"},
      "category": {"type": "string", "enum": ["protein", "vegetable", "grain", "dairy", "spice", "condiment", "other"]},
      "expiry_date": {"type": "string", "format": "date", "nullable": true}
    }
  }
}
```

### Facial Recognition Data
**Purpose**: Biometric data for offline user identification
**Primary Key**: face_id (UUID)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| face_id | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| user_id | UUID | FOREIGN KEY UNIQUE, NOT NULL | One-to-one with user |
| face_features | BLOB | NOT NULL | Encoded facial features |
| feature_version | String | NOT NULL | Algorithm version |
| created_at | DateTime | NOT NULL | Initial capture timestamp |
| updated_at | DateTime | NOT NULL | Last update timestamp |
| confidence_threshold | Float | NOT NULL, 0.0-1.0 | Recognition threshold |

**Validation Rules**:
- face_features stored as encrypted binary data
- confidence_threshold default 0.85
- feature_version tracks algorithm compatibility

### Shared Data Settings
**Purpose**: Configuration for data sharing between users
**Primary Key**: setting_id (UUID)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| setting_id | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| user_id | UUID | FOREIGN KEY, NOT NULL | User granting access |
| shared_with_user_id | UUID | FOREIGN KEY, NOT NULL | User receiving access |
| data_type | Enum | NOT NULL | Type of shared data |
| is_active | Boolean | NOT NULL, default true | Sharing enabled flag |
| created_at | DateTime | NOT NULL | Sharing start time |

**Enum Values for data_type**:
- location, cooking_equipment, ingredients

**Validation Rules**:
- Cannot share with self (user_id ≠ shared_with_user_id)
- Unique combination of (user_id, shared_with_user_id, data_type)

### Dinner Suggestion
**Purpose**: Generated recommendation for user
**Primary Key**: suggestion_id (UUID)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| suggestion_id | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| request_id | UUID | FOREIGN KEY, NOT NULL | Associated request |
| type | Enum | NOT NULL | Suggestion type |
| name | String | NOT NULL, max 100 chars | Dish/restaurant name |
| description | Text | nullable | Detailed description |
| match_score | Float | NOT NULL, 0.0-1.0 | Preference match score |
| rank_order | Integer | NOT NULL, 1-5 | Display order |
| metadata | JSON | nullable | Additional suggestion data |

**Enum Values for type**:
- recipe, restaurant, meal_type

**JSON Schema for metadata**:
```json
{
  "type": "object",
  "properties": {
    "restaurant_address": {"type": "string"},
    "restaurant_phone": {"type": "string"},
    "restaurant_rating": {"type": "number"},
    "recipe_prep_time": {"type": "integer"},
    "recipe_cook_time": {"type": "integer"},
    "recipe_difficulty": {"type": "string"},
    "recipe_servings": {"type": "integer"}
  }
}
```

## Indexes
**Performance Optimization**:
- user_profile(name) - Profile selection lookup
- preference_profile(user_id, is_default) - Default profile retrieval
- dietary_restriction(profile_id) - Preference matching
- cuisine_preference(profile_id) - Preference matching
- facial_recognition_data(user_id) - User identification
- shared_data_settings(user_id, data_type, is_active) - Sharing lookup

## Data Lifecycle
**User Profiles**: Soft delete with cleanup after 180 days inactive
**Facial Recognition**: Update features on failed recognition (drift correction)
**Suggestions**: Auto-delete after 24 hours to save storage
**Shared Settings**: Remove when either user is deleted