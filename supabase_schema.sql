-- Supabase / PostgreSQL Schema for AI Companion Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{"theme": "dark", "sound_enabled": true, "proactive_enabled": true}'::jsonb
);

-- 2. Characters Table
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age INTEGER CHECK (age >= 18),
    avatar TEXT NOT NULL,
    introduction TEXT,
    backstory TEXT,
    appearance JSONB NOT NULL,
    personality TEXT[] NOT NULL,
    behaviour_settings JSONB NOT NULL,
    communication_preferences JSONB NOT NULL,
    relationship_level INTEGER DEFAULT 1,
    relationship_title VARCHAR(50) DEFAULT 'Acquaintance',
    xp INTEGER DEFAULT 0,
    proactive_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender VARCHAR(20) CHECK (sender IN ('user', 'girlfriend')),
    message TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(20),
    status VARCHAR(20) DEFAULT 'sent',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Memories Table
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    category VARCHAR(50) DEFAULT 'general',
    memory_content TEXT NOT NULL,
    importance INTEGER DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_messages_char_time ON messages(character_id, timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_char ON memories(character_id);

-- Row Level Security (RLS) policies
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Characters policy
CREATE POLICY "Users can manage their own characters"
ON characters FOR ALL
USING (auth.uid() = user_id);

-- Messages policy
CREATE POLICY "Users can manage messages for their characters"
ON messages FOR ALL
USING (auth.uid() = user_id);

-- Memories policy
CREATE POLICY "Users can manage memories for their characters"
ON memories FOR ALL
USING (EXISTS (
    SELECT 1 FROM characters WHERE characters.id = memories.character_id AND characters.user_id = auth.uid()
));

