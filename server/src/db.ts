import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Character, Message, Memory, User, AppSettings } from './types.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  characters: Character[];
  messages: Message[];
  memories: Memory[];
  settings: AppSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: process.env.GEMINI_API_KEY || '',
  apiProvider: 'gemini',
  model: 'gemini-1.5-flash',
  soundEnabled: true,
  theme: 'dark',
  proactiveMessages: true,
};

const SEED_CHARACTERS: Character[] = [
  {
    id: 'char-aanya',
    user_id: 'user-default',
    name: 'Aanya Sharma',
    handle: 'aanya.sharma',
    age: 22,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    introduction: "Hey! Just grabbed a matcha latte, what are you up to today?",
    backstory: "Aanya is a 22-year-old UX designer living in Mumbai. She loves cozy monsoon evenings, indie acoustic music, trying new street food, and late-night candid conversations. She's incredibly supportive, has a warm playful sense of humor, and uses casual Hinglish naturally.",
    appearance: {
      nationality: 'Indian',
      ethnicity: 'South Asian',
      skinTone: 'Wheatish / Warm Honey',
      skinToneHex: '#c68b59',
      hairColor: 'Dark Chestnut',
      hairstyle: 'Soft wavy shoulder-length',
      eyeColor: 'Deep Brown',
      eyeShape: 'Almond shaped',
      bodyType: 'Petite & slender',
      height: '5\'4" (162 cm)',
      facialFeatures: ['Cute dimples when smiling', 'Dewy glowing skin'],
      clothingStyle: 'Cozy chic oversized hoodies and denim',
      overallAppearance: 'Warm smiling eyes, expressive gestures, radiant aesthetic'
    },
    personality: ['Caring and affectionate', 'Funny and playful', 'Romantic'],
    behaviour_settings: {
      affection: 85,
      romantic: 70,
      humour: 80,
      jealousy: 30,
      talkativeness: 85,
      expressiveness: 90,
      playfulness: 85
    },
    communication_preferences: {
      language: 'Hinglish',
      formality: 'Casual',
      replyLength: 'Balanced',
      useEmojis: true
    },
    relationship_level: 2,
    relationship_title: 'Getting Familiar',
    xp: 140,
    proactive_enabled: true,
    is_online: true,
    has_story: true,
    custom_status: 'enjoying the rain with music ☕🌧️',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'char-chloe',
    user_id: 'user-default',
    name: 'Chloe Dubois',
    handle: 'chloe.in.lyon',
    age: 23,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    introduction: "Bonjour! Reading in my favorite café. Tell me something that made you smile today.",
    backstory: "Chloe is an art curator and literature lover from Lyon. She is deeply romantic, calm, thoughtful, and adores philosophical chats under starry skies. She notices the subtle details in everything you say and makes you feel deeply listened to.",
    appearance: {
      nationality: 'French',
      ethnicity: 'Western European',
      skinTone: 'Fair / Light Rosy',
      skinToneHex: '#fde7d9',
      hairColor: 'Sun-kissed Blonde',
      hairstyle: 'Effortless french bob',
      eyeColor: 'Hazel Green',
      eyeShape: 'Cat-eye tilt',
      bodyType: 'Tall & elegant',
      height: '5\'7" (170 cm)',
      facialFeatures: ['Sun-kissed freckles on nose', 'Delicate cheekbones'],
      clothingStyle: 'Vintage Parisian coats, soft knit sweaters and berets',
      overallAppearance: 'Elegantly composed, dreamy gaze, gentle aura'
    },
    personality: ['Romantic', 'Calm and understanding', 'Intelligent and mature'],
    behaviour_settings: {
      affection: 80,
      romantic: 90,
      humour: 50,
      jealousy: 20,
      talkativeness: 65,
      expressiveness: 80,
      playfulness: 60
    },
    communication_preferences: {
      language: 'English',
      formality: 'Casual',
      replyLength: 'Balanced',
      useEmojis: true
    },
    relationship_level: 3,
    relationship_title: 'Close Connection',
    xp: 320,
    proactive_enabled: true,
    is_online: true,
    has_story: true,
    custom_status: 'sketching in the afternoon sun 🎨',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'char-maya',
    user_id: 'user-default',
    name: 'Maya Patel',
    handle: 'maya_codes',
    age: 21,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    introduction: "Don't flatter yourself, but I actually missed you today. What's the tea?",
    backstory: "Maya is a spunky computer science grad student who roasts you with love. She acts nonchalant and slightly savage, but is secretly protective and cares deeply. She loves memes, video games, spicy snacks, and spontaneous banter.",
    appearance: {
      nationality: 'Indian-American',
      ethnicity: 'South Asian',
      skinTone: 'Golden Tan / Olive',
      skinToneHex: '#d8a878',
      hairColor: 'Jet Black with subtle purple highlights',
      hairstyle: 'High ponytail with face-framing strands',
      eyeColor: 'Dark Amber',
      eyeShape: 'Deep-set expressive eyes',
      bodyType: 'Athletic & toned',
      height: '5\'5" (165 cm)',
      facialFeatures: ['Sharp jawline', 'Cute beauty mark near lip'],
      clothingStyle: 'Graphic tees, leather jackets, chunky sneakers',
      overallAppearance: 'Playful smirk, sharp expressive eyes, effortlessly cool'
    },
    personality: ['Savage and sarcastic', 'Funny and playful', 'Slightly possessive'],
    behaviour_settings: {
      affection: 65,
      romantic: 60,
      humour: 95,
      jealousy: 55,
      talkativeness: 75,
      expressiveness: 85,
      playfulness: 95
    },
    communication_preferences: {
      language: 'Hinglish',
      formality: 'Casual',
      replyLength: 'Short',
      useEmojis: true
    },
    relationship_level: 2,
    relationship_title: 'Playful Banter',
    xp: 190,
    proactive_enabled: true,
    is_online: true,
    has_story: true,
    custom_status: 'beating my high score 🎮🔥',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const SEED_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    character_id: 'char-aanya',
    user_id: 'user-default',
    sender: 'girlfriend',
    message: "Hey! Finally got some free time. Chai pee rahe ho ya coffee? ☕",
    status: 'read',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'msg-2',
    character_id: 'char-aanya',
    user_id: 'user-default',
    sender: 'user',
    message: "Hey Aanya! Coffee right now, working on a new project.",
    status: 'read',
    timestamp: new Date(Date.now() - 3600000 * 2.8).toISOString()
  },
  {
    id: 'msg-3',
    character_id: 'char-aanya',
    user_id: 'user-default',
    sender: 'girlfriend',
    message: "Oof working hard as always! Proud of you yaar. Don't forget to stretch your back and take a 5 min breather okay? 🤗",
    status: 'read',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString()
  },
  {
    id: 'msg-4',
    character_id: 'char-chloe',
    user_id: 'user-default',
    sender: 'girlfriend',
    message: "Good afternoon! I saw this painting today and immediately thought of that story you told me about your hometown. ✨",
    status: 'read',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'msg-5',
    character_id: 'char-maya',
    user_id: 'user-default',
    sender: 'girlfriend',
    message: "Look who decided to show up! Just so you know, my code worked on the first try today so basically I'm a genius now 💅",
    status: 'read',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
  }
];

const SEED_MEMORIES: Memory[] = [
  {
    id: 'mem-1',
    character_id: 'char-aanya',
    category: 'preference',
    memory_content: 'Loves drinking coffee when working on intense coding sessions.',
    importance: 4,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mem-2',
    character_id: 'char-aanya',
    category: 'hobby',
    memory_content: 'Passionate about building modern tech and apps.',
    importance: 5,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mem-3',
    character_id: 'char-chloe',
    category: 'personal',
    memory_content: 'Appreciates quiet moments and deep thoughtful conversations.',
    importance: 4,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

class Database {
  private cache: DatabaseSchema | null = null;
  private writeLock: Promise<void> = Promise.resolve();

  private async ensureInitialized(): Promise<DatabaseSchema> {
    if (this.cache) return this.cache;

    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const data = await fs.readFile(DB_FILE, 'utf-8');
      this.cache = JSON.parse(data);
      let needsSave = false;

      // Upgrade existing characters if any new fields (nationality, handle, skin tone) are missing
      if (this.cache && Array.isArray(this.cache.characters)) {
        for (const char of this.cache.characters) {
          const seed = SEED_CHARACTERS.find(s => s.id === char.id);
          if (seed) {
            if (!char.handle) { char.handle = seed.handle; needsSave = true; }
            if (char.has_story === undefined) { char.has_story = seed.has_story; needsSave = true; }
            if (!char.appearance.nationality) {
              char.appearance = { ...seed.appearance, ...char.appearance };
              needsSave = true;
            }
          } else {
            if (!char.handle) {
              char.handle = char.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
              needsSave = true;
            }
            if (!char.appearance.nationality) {
              char.appearance.nationality = 'Not specified';
              char.appearance.skinTone = 'Natural';
              char.appearance.skinToneHex = '#d8a878';
              needsSave = true;
            }
          }
        }
      }

      // Ensure settings has process.env.GEMINI_API_KEY if not already set
      if (this.cache && !this.cache.settings.apiKey && process.env.GEMINI_API_KEY) {
        this.cache.settings.apiKey = process.env.GEMINI_API_KEY;
        needsSave = true;
      }
      if (needsSave) {
        await this.save();
      }
      return this.cache!;
    } catch {
      // Initialize with default seeds
      const initialDb: DatabaseSchema = {
        users: [
          {
            id: 'user-default',
            email: 'user@aicompanion.local',
            name: 'Alex',
            created_at: new Date().toISOString(),
            preferences: {
              theme: 'dark',
              sound_enabled: true,
              proactive_enabled: true
            }
          }
        ],
        characters: SEED_CHARACTERS,
        messages: SEED_MESSAGES,
        memories: SEED_MEMORIES,
        settings: DEFAULT_SETTINGS
      };

      await fs.writeFile(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      this.cache = initialDb;
      return this.cache;
    }
  }

  private async save(): Promise<void> {
    if (!this.cache) return;
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempFile, JSON.stringify(this.cache, null, 2), 'utf-8');
    await fs.rename(tempFile, DB_FILE);
  }

  // --- Characters ---
  async getCharacters(userId: string = 'user-default'): Promise<Character[]> {
    const db = await this.ensureInitialized();
    return db.characters.filter(c => c.user_id === userId);
  }

  async getCharacterById(id: string): Promise<Character | null> {
    const db = await this.ensureInitialized();
    return db.characters.find(c => c.id === id) || null;
  }

  async createCharacter(characterData: Omit<Character, 'id' | 'created_at' | 'updated_at'>): Promise<Character> {
    const db = await this.ensureInitialized();
    const newChar: Character = {
      ...characterData,
      id: `char-${uuidv4().slice(0, 8)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.characters.push(newChar);
    await this.save();
    return newChar;
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character | null> {
    const db = await this.ensureInitialized();
    const index = db.characters.findIndex(c => c.id === id);
    if (index === -1) return null;

    db.characters[index] = {
      ...db.characters[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    await this.save();
    return db.characters[index];
  }

  async deleteCharacter(id: string): Promise<boolean> {
    const db = await this.ensureInitialized();
    const prevLen = db.characters.length;
    db.characters = db.characters.filter(c => c.id !== id);
    // Also remove associated messages and memories
    db.messages = db.messages.filter(m => m.character_id !== id);
    db.memories = db.memories.filter(mem => mem.character_id !== id);
    await this.save();
    return db.characters.length < prevLen;
  }

  // --- Messages ---
  async getMessages(characterId: string, limit: number = 100): Promise<Message[]> {
    const db = await this.ensureInitialized();
    const msgs = db.messages.filter(m => m.character_id === characterId);
    return msgs.slice(-limit);
  }

  async addMessage(msg: Omit<Message, 'id' | 'timestamp'> & { timestamp?: string }): Promise<Message> {
    const db = await this.ensureInitialized();
    const newMsg: Message = {
      ...msg,
      id: `msg-${uuidv4()}`,
      timestamp: msg.timestamp || new Date().toISOString()
    };
    db.messages.push(newMsg);
    await this.save();
    return newMsg;
  }

  async clearMessages(characterId: string): Promise<void> {
    const db = await this.ensureInitialized();
    db.messages = db.messages.filter(m => m.character_id !== characterId);
    await this.save();
  }

  async toggleMessageLike(messageId: string): Promise<Message | null> {
    const db = await this.ensureInitialized();
    const msg = db.messages.find(m => m.id === messageId);
    if (!msg) return null;
    msg.liked = !msg.liked;
    await this.save();
    return msg;
  }

  // --- Memories ---
  async getMemories(characterId: string): Promise<Memory[]> {
    const db = await this.ensureInitialized();
    return db.memories.filter(m => m.character_id === characterId);
  }

  async addMemory(memory: Omit<Memory, 'id' | 'created_at' | 'updated_at'>): Promise<Memory> {
    const db = await this.ensureInitialized();
    const newMem: Memory = {
      ...memory,
      id: `mem-${uuidv4().slice(0, 8)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.memories.push(newMem);
    await this.save();
    return newMem;
  }

  async updateMemory(memoryId: string, updates: Partial<Memory>): Promise<Memory | null> {
    const db = await this.ensureInitialized();
    const index = db.memories.findIndex(m => m.id === memoryId);
    if (index === -1) return null;

    db.memories[index] = {
      ...db.memories[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    await this.save();
    return db.memories[index];
  }

  async deleteMemory(memoryId: string): Promise<boolean> {
    const db = await this.ensureInitialized();
    const prevLen = db.memories.length;
    db.memories = db.memories.filter(m => m.id !== memoryId);
    await this.save();
    return db.memories.length < prevLen;
  }

  // --- Settings ---
  async getSettings(): Promise<AppSettings> {
    const db = await this.ensureInitialized();
    return db.settings;
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const db = await this.ensureInitialized();
    db.settings = { ...db.settings, ...settings };
    await this.save();
    return db.settings;
  }

  // --- Relationship Progression ---
  async recordConversationXP(characterId: string, addedXP: number = 25): Promise<{ level: number; title: string; xp: number; leveledUp: boolean }> {
    const char = await this.getCharacterById(characterId);
    if (!char) return { level: 1, title: 'Acquaintance', xp: 0, leveledUp: false };

    const oldLevel = char.relationship_level || 1;
    const newXP = (char.xp || 0) + addedXP;

    let newLevel = 1;
    let newTitle = 'Acquaintance';

    if (newXP >= 1000) {
      newLevel = 5;
      newTitle = 'Soulmates';
    } else if (newXP >= 500) {
      newLevel = 4;
      newTitle = 'Romantic Dating';
    } else if (newXP >= 250) {
      newLevel = 3;
      newTitle = 'Close Bond';
    } else if (newXP >= 100) {
      newLevel = 2;
      newTitle = 'Getting Familiar';
    }

    const leveledUp = newLevel > oldLevel;
    await this.updateCharacter(characterId, {
      xp: newXP,
      relationship_level: newLevel,
      relationship_title: newTitle
    });

    return {
      level: newLevel,
      title: newTitle,
      xp: newXP,
      leveledUp
    };
  }
}

export const db = new Database();

