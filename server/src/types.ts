export interface UserPreferences {
  theme: 'dark' | 'light';
  sound_enabled: boolean;
  proactive_enabled: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  preferences: UserPreferences;
}

export interface Appearance {
  nationality?: string;
  ethnicity?: string;
  skinTone?: string;
  skinToneHex?: string;
  hairColor: string;
  hairstyle: string;
  eyeColor: string;
  eyeShape?: string;
  bodyType?: string;
  height?: string;
  facialFeatures?: string[];
  clothingStyle: string;
  overallAppearance: string;
}

export interface BehaviourSettings {
  affection: number; // 0-100
  romantic: number; // 0-100
  humour: number; // 0-100
  jealousy: number; // 0-100
  talkativeness: number; // 0-100
  expressiveness: number; // 0-100
  playfulness: number; // 0-100
}

export interface CommunicationPreferences {
  language: 'English' | 'Hindi' | 'Hinglish';
  formality: 'Casual' | 'Formal' | 'Flirty';
  replyLength: 'Short' | 'Balanced' | 'Detailed';
  useEmojis: boolean;
}

export interface Character {
  id: string;
  user_id: string;
  name: string;
  handle?: string;
  age: number;
  avatar: string;
  introduction: string;
  backstory: string;
  appearance: Appearance;
  personality: string[];
  behaviour_settings: BehaviourSettings;
  communication_preferences: CommunicationPreferences;
  relationship_level: number;
  relationship_title: string;
  xp: number;
  proactive_enabled: boolean;
  is_online?: boolean;
  custom_status?: string;
  has_story?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  character_id: string;
  user_id: string;
  sender: 'user' | 'girlfriend';
  message: string;
  media_url?: string;
  media_type?: 'image' | 'audio';
  status: 'sent' | 'delivered' | 'read';
  liked?: boolean;
  timestamp: string;
}

export interface Memory {
  id: string;
  character_id: string;
  category: 'personal' | 'preference' | 'hobby' | 'event' | 'inside_joke' | 'general';
  memory_content: string;
  importance: number; // 1 to 5
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  apiKey?: string;
  apiProvider: 'gemini' | 'openai' | 'groq' | 'openrouter';
  model: string;
  soundEnabled: boolean;
  theme: 'dark' | 'light';
  proactiveMessages: boolean;
}

export interface ChatResponsePayload {
  userMessage: Message;
  aiMessage: Message;
  newMemories?: Memory[];
  relationshipUpdate?: {
    level: number;
    title: string;
    xp: number;
    leveledUp: boolean;
  };
}
