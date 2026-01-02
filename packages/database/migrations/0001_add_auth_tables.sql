-- Add authentication tables for user credentials and sessions
-- Generated to support auth system with JWT tokens and session management

-- Create enums for session management if they don't exist
DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('active', 'revoked', 'expired', 'replaced');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE session_invalidation_reason AS ENUM (
        'manual',
        'password_rotated',
        'refresh_rotated',
        'session_limit',
        'suspicious_activity',
        'user_disabled',
        'logout_all',
        'expired'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create user_credentials table for storing password hashes and lockout information
CREATE TABLE IF NOT EXISTS user_credentials (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    failed_attempt_count INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create auth_sessions table for managing refresh tokens and session state
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    refresh_token_version INTEGER NOT NULL DEFAULT 1,
    password_version INTEGER NOT NULL DEFAULT 1,
    status session_status NOT NULL DEFAULT 'active',
    user_agent TEXT,
    ip_address INET,
    device_fingerprint TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason session_invalidation_reason,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_status_expires ON auth_sessions(status, expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_sessions_refresh_token_hash ON auth_sessions(refresh_token_hash);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
DROP TRIGGER IF EXISTS trg_user_credentials_updated_at ON user_credentials;
CREATE TRIGGER trg_user_credentials_updated_at BEFORE UPDATE ON user_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_auth_sessions_updated_at ON auth_sessions;
CREATE TRIGGER trg_auth_sessions_updated_at BEFORE UPDATE ON auth_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
