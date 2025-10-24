-- Dinner Decision App Database Schema
-- Version: 1.0.0

PRAGMA foreign_keys = ON;

-- User Profile table
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    location_lat REAL,
    location_lng REAL,
    location_updated DATETIME
);

-- Authentication table
CREATE TABLE IF NOT EXISTS authentication (
    auth_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    phone_number TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    save_credentials BOOLEAN NOT NULL DEFAULT 0,
    last_login DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);

-- Preference Profile table
CREATE TABLE IF NOT EXISTS preference_profiles (
    profile_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

-- Dietary Restriction table
CREATE TABLE IF NOT EXISTS dietary_restrictions (
    restriction_id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'vegetarian', 'vegan', 'gluten_free', 'dairy_free',
        'nut_allergy', 'shellfish_allergy', 'kosher', 'halal', 'custom'
    )),
    custom_name TEXT,
    FOREIGN KEY (profile_id) REFERENCES preference_profiles(profile_id) ON DELETE CASCADE,
    UNIQUE(profile_id, type, custom_name)
);

-- Cuisine Preference table
CREATE TABLE IF NOT EXISTS cuisine_preferences (
    preference_id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    cuisine_type TEXT NOT NULL CHECK (cuisine_type IN (
        'italian', 'mexican', 'chinese', 'japanese', 'thai', 'indian',
        'french', 'american', 'mediterranean', 'middle_eastern', 'korean',
        'vietnamese', 'greek', 'spanish', 'german', 'british', 'african', 'caribbean'
    )),
    preference_level INTEGER NOT NULL CHECK (preference_level BETWEEN 1 AND 5),
    FOREIGN KEY (profile_id) REFERENCES preference_profiles(profile_id) ON DELETE CASCADE,
    UNIQUE(profile_id, cuisine_type)
);

-- Cooking Context table
CREATE TABLE IF NOT EXISTS cooking_contexts (
    context_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    available_time INTEGER NOT NULL CHECK (available_time > 0),
    equipment_list TEXT NOT NULL, -- JSON array
    ingredients_list TEXT NOT NULL, -- JSON array
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Facial Recognition Data table
CREATE TABLE IF NOT EXISTS facial_recognition_data (
    face_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    face_features BLOB NOT NULL,
    feature_version TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confidence_threshold REAL NOT NULL DEFAULT 0.85 CHECK (confidence_threshold BETWEEN 0.0 AND 1.0),
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Shared Data Settings table
CREATE TABLE IF NOT EXISTS shared_data_settings (
    setting_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    shared_with_user_id TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK (data_type IN ('location', 'cooking_equipment', 'ingredients')),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, shared_with_user_id, data_type),
    CHECK (user_id != shared_with_user_id)
);

-- Suggestion Request table (temporary storage)
CREATE TABLE IF NOT EXISTS suggestion_requests (
    request_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    profile_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('cook_at_home', 'go_out')),
    location_lat REAL,
    location_lng REAL,
    temporary_preferences TEXT, -- JSON
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES preference_profiles(profile_id) ON DELETE CASCADE
);

-- Dinner Suggestion table
CREATE TABLE IF NOT EXISTS dinner_suggestions (
    suggestion_id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('recipe', 'restaurant', 'meal_type')),
    name TEXT NOT NULL,
    description TEXT,
    match_score REAL NOT NULL CHECK (match_score BETWEEN 0.0 AND 1.0),
    rank_order INTEGER NOT NULL CHECK (rank_order BETWEEN 1 AND 10),
    metadata TEXT, -- JSON
    FOREIGN KEY (request_id) REFERENCES suggestion_requests(request_id) ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_profiles_name ON user_profiles(name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_used ON user_profiles(last_used);
CREATE INDEX IF NOT EXISTS idx_authentication_email ON authentication(email);
CREATE INDEX IF NOT EXISTS idx_authentication_phone ON authentication(phone_number);
CREATE INDEX IF NOT EXISTS idx_authentication_user_id ON authentication(user_id);
CREATE INDEX IF NOT EXISTS idx_preference_profiles_user_id ON preference_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_preference_profiles_default ON preference_profiles(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_dietary_restrictions_profile_id ON dietary_restrictions(profile_id);
CREATE INDEX IF NOT EXISTS idx_cuisine_preferences_profile_id ON cuisine_preferences(profile_id);
CREATE INDEX IF NOT EXISTS idx_cooking_contexts_user_id ON cooking_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_facial_recognition_user_id ON facial_recognition_data(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_data_settings_user_id ON shared_data_settings(user_id, data_type, is_active);
CREATE INDEX IF NOT EXISTS idx_suggestion_requests_user_id ON suggestion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_requests_expires ON suggestion_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_dinner_suggestions_request_id ON dinner_suggestions(request_id);
CREATE INDEX IF NOT EXISTS idx_dinner_suggestions_rank ON dinner_suggestions(request_id, rank_order);

-- Triggers for maintaining data integrity

-- Update last_used when user profile is accessed
CREATE TRIGGER IF NOT EXISTS update_user_last_used
    AFTER UPDATE ON preference_profiles
    WHEN NEW.profile_id != OLD.profile_id
BEGIN
    UPDATE user_profiles
    SET last_used = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;
END;

-- Ensure only one default preference profile per user
CREATE TRIGGER IF NOT EXISTS enforce_single_default_profile
    AFTER UPDATE OF is_default ON preference_profiles
    WHEN NEW.is_default = 1
BEGIN
    UPDATE preference_profiles
    SET is_default = 0
    WHERE user_id = NEW.user_id AND profile_id != NEW.profile_id AND is_default = 1;
END;

-- Clean up expired suggestion requests and related suggestions
CREATE TRIGGER IF NOT EXISTS cleanup_expired_suggestions
    AFTER INSERT ON suggestion_requests
BEGIN
    DELETE FROM suggestion_requests WHERE expires_at < CURRENT_TIMESTAMP;
END;

-- Update cooking context timestamp
CREATE TRIGGER IF NOT EXISTS update_cooking_context_timestamp
    AFTER UPDATE ON cooking_contexts
BEGIN
    UPDATE cooking_contexts
    SET updated_at = CURRENT_TIMESTAMP
    WHERE context_id = NEW.context_id;
END;

-- Update facial recognition timestamp
CREATE TRIGGER IF NOT EXISTS update_facial_recognition_timestamp
    AFTER UPDATE ON facial_recognition_data
BEGIN
    UPDATE facial_recognition_data
    SET updated_at = CURRENT_TIMESTAMP
    WHERE face_id = NEW.face_id;
END;