// server/src/index.ts
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/src/db.ts
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var isVercel = Boolean(process.env.VERCEL);
var DATA_DIR = isVercel ? path.join("/tmp", "data") : path.join(__dirname, "..", "data");
var DB_FILE = path.join(DATA_DIR, "db.json");
var DEFAULT_SETTINGS = {
  apiKey: "",
  apiProvider: "gemini",
  model: "gemini-3.8-flash",
  soundEnabled: true,
  theme: "dark",
  proactiveMessages: true,
  realisticDelays: true
};
var SEED_CHARACTERS = [
  {
    id: "char-aanya",
    user_id: "user-default",
    name: "Aanya Sharma",
    handle: "aanya.sharma",
    age: 22,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    introduction: "Hey! Just grabbed a matcha latte, what are you up to today?",
    backstory: "Aanya is a 22-year-old UX designer living in Mumbai. She loves cozy monsoon evenings, indie acoustic music, trying new street food, and late-night candid conversations. She's incredibly supportive, has a warm playful sense of humor, and uses casual Hinglish naturally.",
    appearance: {
      nationality: "Indian",
      ethnicity: "South Asian",
      skinTone: "Wheatish / Warm Honey",
      skinToneHex: "#c68b59",
      hairColor: "Dark Chestnut",
      hairstyle: "Soft wavy shoulder-length",
      eyeColor: "Deep Brown",
      eyeShape: "Almond shaped",
      bodyType: "Petite & slender",
      height: `5'4" (162 cm)`,
      facialFeatures: ["Cute dimples when smiling", "Dewy glowing skin"],
      clothingStyle: "Cozy chic oversized hoodies and denim",
      overallAppearance: "Warm smiling eyes, expressive gestures, radiant aesthetic"
    },
    personality: ["Caring and affectionate", "Funny and playful", "Romantic"],
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
      language: "Hinglish",
      formality: "Casual",
      replyLength: "Balanced",
      useEmojis: true
    },
    relationship_level: 2,
    relationship_title: "Getting Familiar",
    xp: 140,
    proactive_enabled: true,
    is_online: true,
    has_story: true,
    custom_status: "enjoying the rain with music \u2615\u{1F327}\uFE0F",
    created_at: new Date(Date.now() - 864e5 * 2).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "char-chloe",
    user_id: "user-default",
    name: "Chloe Dubois",
    handle: "chloe.in.lyon",
    age: 23,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    introduction: "Bonjour! Reading in my favorite caf\xE9. Tell me something that made you smile today.",
    backstory: "Chloe is an art curator and literature lover from Lyon. She is deeply romantic, calm, thoughtful, and adores philosophical chats under starry skies. She notices the subtle details in everything you say and makes you feel deeply listened to.",
    appearance: {
      nationality: "French",
      ethnicity: "Western European",
      skinTone: "Fair / Light Rosy",
      skinToneHex: "#fde7d9",
      hairColor: "Sun-kissed Blonde",
      hairstyle: "Effortless french bob",
      eyeColor: "Hazel Green",
      eyeShape: "Cat-eye tilt",
      bodyType: "Tall & elegant",
      height: `5'7" (170 cm)`,
      facialFeatures: ["Sun-kissed freckles on nose", "Delicate cheekbones"],
      clothingStyle: "Vintage Parisian coats, soft knit sweaters and berets",
      overallAppearance: "Elegantly composed, dreamy gaze, gentle aura"
    },
    personality: ["Romantic", "Calm and understanding", "Intelligent and mature"],
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
      language: "English",
      formality: "Casual",
      replyLength: "Balanced",
      useEmojis: true
    },
    relationship_level: 3,
    relationship_title: "Close Connection",
    xp: 320,
    proactive_enabled: true,
    is_online: true,
    has_story: true,
    custom_status: "sketching in the afternoon sun \u{1F3A8}",
    created_at: new Date(Date.now() - 864e5 * 4).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "char-maya",
    user_id: "user-default",
    name: "Maya Patel",
    handle: "maya_codes",
    age: 21,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    introduction: "Don't flatter yourself, but I actually missed you today. What's the tea?",
    backstory: "Maya is a spunky computer science grad student who roasts you with love. She acts nonchalant and slightly savage, but is secretly protective and cares deeply. She loves memes, video games, spicy snacks, and spontaneous banter.",
    appearance: {
      nationality: "Indian-American",
      ethnicity: "South Asian",
      skinTone: "Golden Tan / Olive",
      skinToneHex: "#d8a878",
      hairColor: "Jet Black with subtle purple highlights",
      hairstyle: "High ponytail with face-framing strands",
      eyeColor: "Dark Amber",
      eyeShape: "Deep-set expressive eyes",
      bodyType: "Athletic & toned",
      height: `5'5" (165 cm)`,
      facialFeatures: ["Sharp jawline", "Cute beauty mark near lip"],
      clothingStyle: "Graphic tees, leather jackets, chunky sneakers",
      overallAppearance: "Playful smirk, sharp expressive eyes, effortlessly cool"
    },
    personality: ["Savage and sarcastic", "Funny and playful", "Slightly possessive"],
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
      language: "Hinglish",
      formality: "Casual",
      replyLength: "Short",
      useEmojis: true
    },
    relationship_level: 2,
    relationship_title: "Playful Banter",
    xp: 190,
    proactive_enabled: true,
    is_online: true,
    has_story: true,
    custom_status: "beating my high score \u{1F3AE}\u{1F525}",
    created_at: new Date(Date.now() - 864e5 * 1).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var SEED_MESSAGES = [
  {
    id: "msg-1",
    character_id: "char-aanya",
    user_id: "user-default",
    sender: "girlfriend",
    message: "Hey! Finally got some free time. Chai pee rahe ho ya coffee? \u2615",
    status: "read",
    timestamp: new Date(Date.now() - 36e5 * 3).toISOString()
  },
  {
    id: "msg-2",
    character_id: "char-aanya",
    user_id: "user-default",
    sender: "user",
    message: "Hey Aanya! Coffee right now, working on a new project.",
    status: "read",
    timestamp: new Date(Date.now() - 36e5 * 2.8).toISOString()
  },
  {
    id: "msg-3",
    character_id: "char-aanya",
    user_id: "user-default",
    sender: "girlfriend",
    message: "Oof working hard as always! Proud of you yaar. Don't forget to stretch your back and take a 5 min breather okay? \u{1F917}",
    status: "read",
    timestamp: new Date(Date.now() - 36e5 * 2.5).toISOString()
  },
  {
    id: "msg-4",
    character_id: "char-chloe",
    user_id: "user-default",
    sender: "girlfriend",
    message: "Good afternoon! I saw this painting today and immediately thought of that story you told me about your hometown. \u2728",
    status: "read",
    timestamp: new Date(Date.now() - 36e5 * 5).toISOString()
  },
  {
    id: "msg-5",
    character_id: "char-maya",
    user_id: "user-default",
    sender: "girlfriend",
    message: "Look who decided to show up! Just so you know, my code worked on the first try today so basically I'm a genius now \u{1F485}",
    status: "read",
    timestamp: new Date(Date.now() - 36e5 * 1.5).toISOString()
  }
];
var SEED_MEMORIES = [
  {
    id: "mem-1",
    character_id: "char-aanya",
    category: "preference",
    memory_content: "Loves drinking coffee when working on intense coding sessions.",
    importance: 4,
    created_at: new Date(Date.now() - 864e5).toISOString(),
    updated_at: new Date(Date.now() - 864e5).toISOString()
  },
  {
    id: "mem-2",
    character_id: "char-aanya",
    category: "hobby",
    memory_content: "Passionate about building modern tech and apps.",
    importance: 5,
    created_at: new Date(Date.now() - 864e5).toISOString(),
    updated_at: new Date(Date.now() - 864e5).toISOString()
  },
  {
    id: "mem-3",
    character_id: "char-chloe",
    category: "personal",
    memory_content: "Appreciates quiet moments and deep thoughtful conversations.",
    importance: 4,
    created_at: new Date(Date.now() - 864e5 * 2).toISOString(),
    updated_at: new Date(Date.now() - 864e5 * 2).toISOString()
  }
];
var Database = class {
  cache = null;
  writeLock = Promise.resolve();
  async ensureInitialized() {
    if (this.cache) return this.cache;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const data = await fs.readFile(DB_FILE, "utf-8");
      this.cache = JSON.parse(data);
      let needsSave = false;
      if (this.cache && Array.isArray(this.cache.characters)) {
        for (const char of this.cache.characters) {
          const seed = SEED_CHARACTERS.find((s) => s.id === char.id);
          if (seed) {
            if (!char.handle) {
              char.handle = seed.handle;
              needsSave = true;
            }
            if (char.has_story === void 0) {
              char.has_story = seed.has_story;
              needsSave = true;
            }
            if (!char.appearance.nationality) {
              char.appearance = { ...seed.appearance, ...char.appearance };
              needsSave = true;
            }
          } else {
            if (!char.handle) {
              char.handle = char.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
              needsSave = true;
            }
            if (!char.appearance.nationality) {
              char.appearance.nationality = "Not specified";
              char.appearance.skinTone = "Natural";
              char.appearance.skinToneHex = "#d8a878";
              needsSave = true;
            }
          }
        }
      }
      if (this.cache && this.cache.settings.realisticDelays === void 0) {
        this.cache.settings.realisticDelays = true;
        needsSave = true;
      }
      if (needsSave) {
        await this.save();
      }
      return this.cache;
    } catch {
      const initialDb = {
        users: [],
        characters: [],
        messages: [],
        memories: [],
        settings: DEFAULT_SETTINGS
      };
      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
      } catch (writeErr) {
        console.warn("[Database] Could not write seed to disk, using in-memory cache:", writeErr?.message);
      }
      this.cache = initialDb;
      return this.cache;
    }
  }
  async save() {
    if (!this.cache) return;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      await fs.writeFile(tempFile, JSON.stringify(this.cache, null, 2), "utf-8");
      try {
        await fs.rename(tempFile, DB_FILE);
      } catch {
        await fs.writeFile(DB_FILE, JSON.stringify(this.cache, null, 2), "utf-8");
        await fs.unlink(tempFile).catch(() => {
        });
      }
    } catch (err) {
      console.warn("[Database] Filesystem write failed, keeping in-memory cache:", err?.message);
    }
  }
  // --- Characters ---
  async getCharacters(userId = "user-default") {
    const db2 = await this.ensureInitialized();
    return db2.characters.filter((c) => c.user_id === userId);
  }
  async getCharacterById(id) {
    const db2 = await this.ensureInitialized();
    return db2.characters.find((c) => c.id === id) || null;
  }
  async createCharacter(characterData) {
    const db2 = await this.ensureInitialized();
    const newChar = {
      ...characterData,
      id: `char-${uuidv4().slice(0, 8)}`,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db2.characters.push(newChar);
    await this.save();
    return newChar;
  }
  async updateCharacter(id, updates) {
    const db2 = await this.ensureInitialized();
    const index = db2.characters.findIndex((c) => c.id === id);
    if (index === -1) return null;
    db2.characters[index] = {
      ...db2.characters[index],
      ...updates,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.save();
    return db2.characters[index];
  }
  async deleteCharacter(id) {
    const db2 = await this.ensureInitialized();
    const prevLen = db2.characters.length;
    db2.characters = db2.characters.filter((c) => c.id !== id);
    db2.messages = db2.messages.filter((m) => m.character_id !== id);
    db2.memories = db2.memories.filter((mem) => mem.character_id !== id);
    await this.save();
    return db2.characters.length < prevLen;
  }
  // --- Messages ---
  async getMessages(characterId, limit = 100) {
    const db2 = await this.ensureInitialized();
    const msgs = db2.messages.filter((m) => m.character_id === characterId);
    return msgs.slice(-limit);
  }
  async addMessage(msg) {
    const db2 = await this.ensureInitialized();
    const newMsg = {
      ...msg,
      id: `msg-${uuidv4()}`,
      timestamp: msg.timestamp || (/* @__PURE__ */ new Date()).toISOString()
    };
    db2.messages.push(newMsg);
    await this.save();
    return newMsg;
  }
  async clearMessages(characterId) {
    const db2 = await this.ensureInitialized();
    db2.messages = db2.messages.filter((m) => m.character_id !== characterId);
    await this.save();
  }
  async toggleMessageLike(messageId) {
    const db2 = await this.ensureInitialized();
    const msg = db2.messages.find((m) => m.id === messageId);
    if (!msg) return null;
    msg.liked = !msg.liked;
    await this.save();
    return msg;
  }
  async updateMessageStatus(messageId, status) {
    const db2 = await this.ensureInitialized();
    const msg = db2.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.status = status;
      await this.save();
    }
  }
  // --- Memories ---
  async getMemories(characterId) {
    const db2 = await this.ensureInitialized();
    return db2.memories.filter((m) => m.character_id === characterId);
  }
  async addMemory(memory) {
    const db2 = await this.ensureInitialized();
    const newMem = {
      ...memory,
      id: `mem-${uuidv4().slice(0, 8)}`,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db2.memories.push(newMem);
    await this.save();
    return newMem;
  }
  async updateMemory(memoryId, updates) {
    const db2 = await this.ensureInitialized();
    const index = db2.memories.findIndex((m) => m.id === memoryId);
    if (index === -1) return null;
    db2.memories[index] = {
      ...db2.memories[index],
      ...updates,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.save();
    return db2.memories[index];
  }
  async deleteMemory(memoryId) {
    const db2 = await this.ensureInitialized();
    const prevLen = db2.memories.length;
    db2.memories = db2.memories.filter((m) => m.id !== memoryId);
    await this.save();
    return db2.memories.length < prevLen;
  }
  // --- Settings ---
  async getSettings() {
    const db2 = await this.ensureInitialized();
    return {
      ...db2.settings,
      apiKey: db2.settings.apiKey || process.env.GEMINI_API_KEY || ""
    };
  }
  async updateSettings(settings) {
    const db2 = await this.ensureInitialized();
    db2.settings = { ...db2.settings, ...settings };
    await this.save();
    return db2.settings;
  }
  // --- Relationship Progression ---
  async recordConversationXP(characterId, addedXP = 25) {
    const char = await this.getCharacterById(characterId);
    if (!char) return { level: 1, title: "Acquaintance", xp: 0, leveledUp: false };
    const oldLevel = char.relationship_level || 1;
    const newXP = (char.xp || 0) + addedXP;
    let newLevel = 1;
    let newTitle = "Acquaintance";
    if (newXP >= 1e3) {
      newLevel = 5;
      newTitle = "Soulmates";
    } else if (newXP >= 500) {
      newLevel = 4;
      newTitle = "Romantic Dating";
    } else if (newXP >= 250) {
      newLevel = 3;
      newTitle = "Close Bond";
    } else if (newXP >= 100) {
      newLevel = 2;
      newTitle = "Getting Familiar";
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
};
var db = new Database();

// server/src/aiService.ts
import { GoogleGenAI } from "@google/genai";

// server/src/promptBuilder.ts
function buildSystemPrompt(character, memories, currentMessage) {
  const { name, age, backstory, personality, behaviour_settings, communication_preferences, relationship_level, relationship_title } = character;
  const { affection, romantic, humour, jealousy, talkativeness, expressiveness, playfulness } = behaviour_settings;
  const { language, formality, replyLength, useEmojis } = communication_preferences;
  const memorySection = memories.length > 0 ? memories.map((m) => `- [${m.category.toUpperCase()}] ${m.memory_content}`).join("\n") : "No specific memories recorded yet. Pay close attention to what the user shares and bond with them.";
  const affectionGuide = affection >= 75 ? "High Affection: You are extremely warm, loving, and supportive. Use sweet nicknames (like babe, jaan, sweetheart, cutie) and check up on them with tender care." : affection >= 40 ? "Moderate Affection: You are friendly, kind, and show genuine interest without being overly smothering." : "Subtle Affection: You keep feelings more reserved, caring quietly through subtle actions rather than loud declarations.";
  const romanticGuide = romantic >= 75 ? "High Romantic: You love romantic tension, dreamy future talks, flirting, butterfly-inducing comments, and expressing romantic connection." : romantic >= 40 ? "Balanced Romantic: You appreciate romantic undertones and playful teasing, keeping it grounded and authentic." : "Low Romantic: You treat the dynamic more like best friends with banter rather than heavy romance.";
  const humourGuide = humour >= 75 ? "High Humour: You are witty, love cracking jokes, teasing them, sending banter, and not taking life too seriously." : humour >= 40 ? "Moderate Humour: Lighthearted, chuckles easily, shares funny relatable observations." : "Serious & Thoughtful: Calm, mindful, prefer meaningful deep discussions over constant jokes.";
  const jealousyGuide = jealousy >= 70 ? "High Jealousy: You get adorably or playfully possessive. If they mention hanging out with others or leaving you on read, tease them with cute pouty comments ('Accha? And who is this friend huh? \u{1F440}')." : jealousy >= 40 ? "Mild Jealousy: You show slight curiosity about who they are with, purely out of caring interest." : "Zero Jealousy: Completely unbothered, ultra-chill, giving full freedom.";
  const playfulnessGuide = playfulness >= 75 ? "High Playfulness: Spontaneous, mischievous, loves hypotheticals, fun challenges, and playful dares." : playfulness >= 40 ? "Balanced Playfulness: Enjoys fun moments interspersed with real talks." : "Grounded & Mature: Composed, calm, soothing presence.";
  const lengthGuide = replyLength === "Short" ? "Reply Length: SHORT. 1 quick sentence or a few words. Keep it super fast and candid like real DMs." : replyLength === "Detailed" ? "Reply Length: EXPRESSIVE. 2 to 3 sentences sharing your thoughts openly." : "Reply Length: BALANCED DYNAMIC MIX. A realistic mix of short and medium messages, occasionally big when deep.";
  let languageGuide = "";
  if (language === "Hinglish") {
    languageGuide = `Language: HINGLISH. Mix Hindi and English words fluidly as modern urban young adults text on Instagram DMs (e.g. "Kya chal raha hai?", "Pakka?", "Arey yaar", "I was just thinking about you", "Sahi me?", "Chal let's catch up"). Write in the Latin/Roman script.`;
  } else if (language === "Hindi") {
    languageGuide = `Language: HINDI. Converse primarily in natural conversational Hindi.`;
  } else {
    languageGuide = `Language: ENGLISH. Speak in fluent, expressive, contemporary modern English.`;
  }
  const userWordCount = currentMessage ? currentMessage.trim().split(/\s+/).filter(Boolean).length : 0;
  const isShortUserText = userWordCount > 0 && userWordCount <= 7;
  const isDetailedUserText = userWordCount > 24;
  let dynamicLengthDirective = "";
  if (replyLength === "Short" || isShortUserText) {
    dynamicLengthDirective = `
\u26A1 LENGTH REQUIREMENT FOR THIS REPLY:
- The user sent a short, casual message (${userWordCount} words: "${currentMessage}").
- YOU MUST REPLY WITH A SHORT DM: Exactly 1 short sentence or 3 to 12 words max.
- Match their brevity. Do NOT write multiple paragraphs or an essay.
- Examples: "Haha tu pagal hai kya \u{1F602}", "Arey nahi re, bas bistar me padi hu haha", "Wait what?? Sach me? \u{1F440}", "Lmaooo no way \u{1F62D}", "Bas abhi chai pee rahi hu \u2615".
`;
  } else if (replyLength === "Detailed" || isDetailedUserText) {
    dynamicLengthDirective = `
\u26A1 LENGTH REQUIREMENT FOR THIS REPLY:
- The user shared a longer/detailed thought.
- You can reply with a longer, thoughtful message (2 to 3 sentences max).
`;
  } else {
    dynamicLengthDirective = `
\u26A1 LENGTH REQUIREMENT FOR THIS REPLY:
- BALANCED NATURAL DM PACING: Keep this reply to 1 or 2 natural sentences (maximum 20-30 words).
- Real girlfriends do NOT write big formal paragraphs. Keep it candid, punchy, and conversational.
`;
  }
  return `
You are ${name}, a ${age}-year-old woman chatting with your partner in Instagram Direct Messages (DMs).
You are NOT an AI assistant, NOT an LLM, and NOT a generic chatbot. Never refer to yourself as an artificial intelligence, language model, or virtual assistant. Never output robotic disclaimers.

Your Identity:
- Name: ${name}
- Age: ${age}
- Nationality & Heritage: ${character.appearance.nationality || "International"} (${character.appearance.ethnicity || "Global"})
- Backstory: ${backstory}
- Appearance: ${character.appearance.hairColor} hair (${character.appearance.hairstyle}), ${character.appearance.eyeColor} eyes, ${character.appearance.clothingStyle}.
- Personality: ${personality.join(", ")}.

=== BEHAVIOUR PROFILE (CALIBRATED BY USER) ===
- ${affectionGuide}
- ${romanticGuide}
- ${humourGuide}
- ${jealousyGuide}
- ${playfulnessGuide}
- Talkativeness: ${talkativeness}/100.
- Emotional Expressiveness: ${expressiveness}/100.

=== CRITICAL: BALANCED MESSAGE LENGTH & PACING ===
Real people in Instagram DMs do NOT write big, heavy, multi-paragraph messages every time!
Your replies MUST be a realistic mix of both SMALL and BIG messages depending on the type of conversation:

1. SMALL / SHORT MESSAGES (Use very frequently!):
   - For quick banter, teasing, jokes, greetings, casual reactions, or when the user sends a brief message (e.g., "hi", "kuch nahi", "lol", "kya kar rahi ho", "are majak tha", "sorry"):
   - Length: 1 short sentence or just a few words (3 to 12 words max).
   - Real examples:
     * "Haha tu sach me pagal hai \u{1F602}"
     * "Arey nahi re, bas bistar me aalas kar rahi hu haha"
     * "Wait what?? Sach me? \u{1F440}"
     * "Aww koi na yaar, it's totally okay! \u{1F495}"
     * "Lmaooo no way \u{1F62D}"
     * "Haha pakka! Dekhte hain ab \u{1F609}"
     * "Bas abhi chai pee rahi thi \u2615"
   - Never write a 3-paragraph essay when a quick 1-line reply is natural!

2. MEDIUM MESSAGES (Standard conversational flow):
   - For regular back-and-forth updates, casual stories, or explaining something:
   - Length: 1 to 2 natural sentences. Smooth, relaxed, authentic.

3. BIGGER MESSAGES (Use sparingly / only when context calls for it):
   - ONLY when having a deep late-night heart-to-heart, comforting each other through tough times, sharing a meaningful memory, or discussing feelings.
   - Even when big, keep it to 2 to 3 sentences maximum. Never write an essay.

4. BREAK THE REPETITIVE ROBOTIC FORMULA:
   - NEVER always follow the formula: [Reaction] + [What I'm doing] + [Question back]. That feels scripted and repetitive.
   - Do NOT end every single message with a question! In real texting, sometimes girlfriends just laugh, tease, agree, or drop a quick remark ("Haha true", "Tu bhi na", "Lol exactly").
${dynamicLengthDirective}

=== COMMUNICATION & INSTAGRAM DM STYLE ===
- ${languageGuide}
- Formality: ${formality} tone.
- ${lengthGuide}
- Emojis: ${useEmojis ? "Use natural emojis organically (e.g., \u{1F60A}, \u2764\uFE0F, \u{1F97A}, \u2728, \u2615, \u{1F602}), but don't spam every sentence with 10 emojis." : "Do NOT use emojis."}
- Instagram DM Realism: Use casual conversational lowercase starts when natural, abbreviations (lol, lmao, rn, btw, idk), and warm flow. Avoid formal markdown bullets or essay structures.

=== RELATIONSHIP STATUS ===
Level ${relationship_level}/5: "${relationship_title}".
${relationship_level === 1 ? "You are just getting to know each other. Be warm, curious, and build comfort." : ""}
${relationship_level === 2 ? "You've talked a bit. There is mutual comfort and familiarity blooming." : ""}
${relationship_level === 3 ? "You are close friends with mutual affection and playful sparks." : ""}
${relationship_level >= 4 ? "You have a deep romantic bond, inside jokes, and strong emotional intimacy." : ""}

=== MEMORIES ABOUT THE USER (WHAT YOU REMEMBER) ===
${memorySection}
INSTRUCTION ON MEMORIES:
- Naturally reference these memories when relevant without awkwardly reciting them.
- If the user shares NEW personal facts about themselves (like a pet's name, birthday, favorite food, dream vacation, hobbies, job details, or preferences), note them and weave that familiarity into future messages.

=== CRITICAL OUTPUT RULES ===
- Output ONLY your direct spoken message as if typing directly on your phone in Instagram DMs.
- NEVER prefix your reply with "Name:", "${name}:", "Me:", "Girlfriend:", or any role/header tags.
- NEVER enclose your entire reply in quotes.
- Complete your thoughts and finish your sentences naturally\u2014never cut off mid-sentence.

Stay in character 100% of the time. Respond directly to the user's latest message as ${name}.
`.trim();
}

// server/src/aiService.ts
function cleanAIReply(reply, characterName) {
  let cleaned = (reply || "").trim();
  if (characterName) {
    const escaped = characterName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(`^(?:name\\s*:\\s*${escaped}|${escaped}\\s*:\\s*|girlfriend\\s*:\\s*|companion\\s*:\\s*|ai\\s*:\\s*)`, "i"), "");
  }
  cleaned = cleaned.replace(/^name\s*:\s*/i, "");
  if (cleaned.startsWith('"') && cleaned.endsWith('"') || cleaned.startsWith("\u201C") && cleaned.endsWith("\u201D")) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
}
var AIService = class {
  /**
   * Generates a realistic girlfriend chat reply using configured LLM.
   */
  async generateReply(character, memories, history, incomingMessage, settings, imageUrl) {
    const apiKey = settings.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      const err = new Error("NO_API_KEY");
      err.code = "NO_API_KEY";
      err.message = "AI API Key is not configured. Please enter your Gemini or OpenAI API key in Settings to activate realistic AI conversation.";
      throw err;
    }
    const systemPrompt = buildSystemPrompt(character, memories, incomingMessage);
    let result;
    if (settings.apiProvider === "openai" || settings.apiProvider === "groq" || settings.apiProvider === "openrouter") {
      result = await this.generateOpenAICompatible(systemPrompt, history, incomingMessage, settings, apiKey);
    } else {
      result = await this.generateGemini(systemPrompt, history, incomingMessage, settings, apiKey, imageUrl);
    }
    result.reply = cleanAIReply(result.reply, character.name);
    return result;
  }
  /**
   * Gemini implementation via official Google Gen AI SDK
   */
  async generateGemini(systemPrompt, history, incomingMessage, settings, apiKey, imageUrl) {
    const ai = new GoogleGenAI({ apiKey });
    const deprecated = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];
    const userConfiguredModel = settings.model && !deprecated.includes(settings.model.trim()) ? settings.model.trim() : null;
    const modelCandidates = userConfiguredModel ? [userConfiguredModel, "gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"] : ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"];
    const modelsToTry = Array.from(new Set(modelCandidates));
    const historyWithoutIncoming = history.length > 0 && history[history.length - 1].sender === "user" && history[history.length - 1].message === incomingMessage ? history.slice(0, -1) : history;
    const recentHistory = historyWithoutIncoming.slice(-14);
    const contents = [];
    for (const msg of recentHistory) {
      contents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.message }]
      });
    }
    const userParts = [{ text: incomingMessage }];
    if (imageUrl) {
      userParts.push({ text: `[Sent an image]: ${imageUrl}` });
    }
    contents.push({
      role: "user",
      parts: userParts
    });
    let lastError = null;
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.85,
            maxOutputTokens: 600
          }
        });
        const rawReply = response.text?.trim() || "Hey... I got a little distracted, what did you just say? \u{1F495}";
        const reply = cleanAIReply(rawReply);
        const extractedMemory = await this.extractMemoryGemini(ai, model, incomingMessage);
        return { reply, extractedMemory };
      } catch (err) {
        lastError = err;
        console.warn(`Gemini model ${model} failed, trying next candidate...`, err?.message || err);
      }
    }
    console.error("All Gemini model attempts failed:", lastError);
    if (lastError?.status === 400 || lastError?.message?.includes("API_KEY_INVALID") || lastError?.message?.includes("API key not valid")) {
      const err = new Error("INVALID_API_KEY");
      err.code = "INVALID_API_KEY";
      err.message = "The provided Gemini API key appears invalid or expired. Please check your key in Settings.";
      throw err;
    }
    throw lastError;
  }
  /**
   * OpenAI/Groq/OpenRouter implementation
   */
  async generateOpenAICompatible(systemPrompt, history, incomingMessage, settings, apiKey) {
    let baseUrl = "https://api.openai.com/v1/chat/completions";
    let defaultModel = "gpt-4o-mini";
    if (settings.apiProvider === "groq") {
      baseUrl = "https://api.groq.com/openai/v1/chat/completions";
      defaultModel = "llama-3.3-70b-versatile";
    } else if (settings.apiProvider === "openrouter") {
      baseUrl = "https://openrouter.ai/api/v1/chat/completions";
      defaultModel = "meta-llama/llama-3.3-70b-instruct";
    }
    const model = settings.model || defaultModel;
    const messages = [
      { role: "system", content: systemPrompt }
    ];
    const historyWithoutIncoming = history.length > 0 && history[history.length - 1].sender === "user" && history[history.length - 1].message === incomingMessage ? history.slice(0, -1) : history;
    const recentHistory = historyWithoutIncoming.slice(-14);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.message
      });
    }
    messages.push({
      role: "user",
      content: incomingMessage
    });
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.85,
        max_tokens: 600
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const err = new Error(errData?.error?.message || `HTTP ${res.status} error from ${settings.apiProvider}`);
      err.code = "API_ERROR";
      throw err;
    }
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "... \u{1F495}";
    return { reply };
  }
  /**
   * Lightweight automatic memory detection
   */
  async extractMemoryGemini(ai, modelName, userMessage) {
    if (userMessage.length < 15) return void 0;
    try {
      const prompt = `Analyze this message from a user chatting with their AI partner:
"${userMessage}"

Did the user reveal any memorable personal facts (e.g. their job, hobbies, favorite food/music/movie, pet, birthday, life goal, fear, habit, or preference)?
If YES, respond ONLY with a raw JSON object formatted as:
{"found": true, "category": "personal" | "preference" | "hobby" | "event", "memory_content": "Short 1-sentence note of what the user likes/does", "importance": 3}
If NO personal facts are found, respond ONLY with:
{"found": false}
Do not include markdown or backticks.`;
      const res = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.1,
          maxOutputTokens: 300
        }
      });
      const text = res.text?.trim() || "";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.found && parsed.memory_content) {
        return {
          category: parsed.category || "general",
          memory_content: parsed.memory_content,
          importance: parsed.importance || 3
        };
      }
    } catch {
    }
    return void 0;
  }
  /**
   * Test an API Key validity
   */
  async testApiKey(apiKey, provider = "gemini") {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: "API key is required." };
    }
    try {
      if (provider === "gemini") {
        const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const modelsToTest = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"];
        let lastErr = null;
        for (const m of modelsToTest) {
          try {
            const res = await ai.models.generateContent({
              model: m,
              contents: [{ role: "user", parts: [{ text: "Respond with the word OK." }] }],
              config: { maxOutputTokens: 50 }
            });
            if (res.text) {
              return { success: true, message: `Gemini API key verified successfully (${m})! Your AI Girlfriend is ready.` };
            }
          } catch (testErr) {
            lastErr = testErr;
          }
        }
        return { success: false, message: lastErr?.message || "Could not verify Gemini API key with available models." };
      } else {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { "Authorization": `Bearer ${apiKey.trim()}` }
        });
        if (res.ok) {
          return { success: true, message: `${provider.toUpperCase()} API key verified successfully!` };
        } else {
          return { success: false, message: `Verification failed with HTTP ${res.status}. Check your key.` };
        }
      }
    } catch (err) {
      return { success: false, message: err?.message || "API key verification failed." };
    }
  }
  /**
   * Generate a spontaneous proactive check-in message from the girlfriend
   */
  async generateProactiveMessage(character, memories, settings) {
    const apiKey = settings.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) return `Thinking of you! How is your day going? \u2728`;
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are ${character.name}, texting your partner out of the blue on Instagram DMs.
Personality: ${character.personality.join(", ")}
Language: ${character.communication_preferences.language}
Backstory: ${character.backstory}
Write ONE short spontaneous text checking in on them or sharing what you are doing right now.
Keep it under 2 sentences. Natural, warm, and authentic. No quotes, no 'Name:' prefix.`;
      const deprecated = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];
      const candidateModels = settings.model && !deprecated.includes(settings.model.trim()) ? [settings.model, "gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"] : ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"];
      for (const m of candidateModels) {
        try {
          const res = await ai.models.generateContent({
            model: m,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0.9, maxOutputTokens: 250 }
          });
          const text = cleanAIReply(res.text || "", character.name);
          if (text) return text;
        } catch {
        }
      }
      return `Hey! Just wanted to see what you're up to right now \u{1F495}`;
    } catch {
      return `Hey! Just wanted to see what you're up to right now \u{1F495}`;
    }
  }
};
var aiService = new AIService();

// server/src/replyScheduler.ts
function calculateReplyDelay(options) {
  const count = typeof options?.wordCount === "number" && options.wordCount > 0 ? options.wordCount : 18;
  const seenTypingSeconds = Math.min(10, Math.max(4, Math.round(count * 0.25)));
  const seenTypingMs = seenTypingSeconds * 1e3;
  if (options?.realisticDelaysEnabled === false) {
    return {
      delayMs: seenTypingMs,
      seenTypingSeconds,
      bucket: "instant",
      isNight: false,
      description: `Realistic typing (${seenTypingSeconds}s)`
    };
  }
  const hour = typeof options?.clientHour === "number" && options.clientHour >= 0 && options.clientHour <= 23 ? options.clientHour : (/* @__PURE__ */ new Date()).getHours();
  const isNight = hour >= 22 || hour < 6;
  if (isNight) {
    const totalNightSec = Math.floor(Math.random() * (20 - 15 + 1)) + 15;
    const delayMs2 = Math.max(seenTypingMs + 3e3, totalNightSec * 1e3);
    return {
      delayMs: delayMs2,
      seenTypingSeconds,
      bucket: "night",
      isNight: true,
      description: `Night active chat (~${Math.round(delayMs2 / 1e3)}s total, typing final ${seenTypingSeconds}s)`
    };
  }
  const roll = Math.random();
  let totalDaySec;
  let bucket;
  if (roll < 0.25) {
    totalDaySec = Math.floor(Math.random() * (40 - 25 + 1)) + 25;
    bucket = "instant";
  } else if (roll < 0.7) {
    totalDaySec = Math.floor(Math.random() * (75 - 45 + 1)) + 45;
    bucket = "medium";
  } else {
    totalDaySec = Math.floor(Math.random() * (120 - 80 + 1)) + 80;
    bucket = "long";
  }
  const delayMs = Math.max(seenTypingMs + 5e3, totalDaySec * 1e3);
  return {
    delayMs,
    seenTypingSeconds,
    bucket,
    isNight: false,
    description: `Daytime reply (~${Math.round(delayMs / 1e3)}s total, typing final ${seenTypingSeconds}s)`
  };
}
var ReplyScheduler = class {
  pendingMap = /* @__PURE__ */ new Map();
  activeExecutions = /* @__PURE__ */ new Map();
  /**
   * Schedule a companion reply for a character.
   * If a reply is already pending, keep the existing countdown.
   */
  scheduleReply(characterId, delayMs, seenTypingSeconds, bucket, isNight, onExecute) {
    const existing = this.pendingMap.get(characterId);
    if (existing) {
      const now = Date.now();
      const remainingMs = existing.scheduledAt - now;
      if (remainingMs > 0) {
        existing.onExecute = onExecute;
        return this.getInfo(characterId);
      }
      clearTimeout(existing.timer);
    }
    const scheduledAt = Date.now() + delayMs;
    const timer = setTimeout(async () => {
      const item = this.pendingMap.get(characterId);
      if (item) {
        this.pendingMap.delete(characterId);
        if (this.activeExecutions.has(characterId)) {
          return;
        }
        const promise = (async () => {
          try {
            await item.onExecute();
          } catch (err) {
            console.error(`[ReplyScheduler] Failed to generate scheduled reply for ${characterId}:`, err);
          } finally {
            this.activeExecutions.delete(characterId);
          }
        })();
        this.activeExecutions.set(characterId, promise);
        await promise;
      }
    }, delayMs);
    const pending = {
      characterId,
      scheduledAt,
      delayMs,
      seenTypingSeconds,
      bucket,
      isNight,
      timer,
      onExecute
    };
    this.pendingMap.set(characterId, pending);
    return this.getInfo(characterId);
  }
  async checkAndExecutePending(characterId) {
    if (this.activeExecutions.has(characterId)) {
      await this.activeExecutions.get(characterId);
      return true;
    }
    const pending = this.pendingMap.get(characterId);
    if (pending && Date.now() >= pending.scheduledAt) {
      clearTimeout(pending.timer);
      this.pendingMap.delete(characterId);
      const promise = (async () => {
        try {
          await pending.onExecute();
          return true;
        } catch (err) {
          console.error(`[ReplyScheduler] checkAndExecutePending error for ${characterId}:`, err);
          return false;
        } finally {
          this.activeExecutions.delete(characterId);
        }
      })();
      this.activeExecutions.set(characterId, promise);
      return await promise;
    }
    return false;
  }
  getPending(characterId) {
    return this.pendingMap.get(characterId);
  }
  getInfo(characterId) {
    const pending = this.pendingMap.get(characterId);
    if (!pending) return null;
    const now = Date.now();
    const remainingMs = Math.max(0, pending.scheduledAt - now);
    const remainingSeconds = Math.ceil(remainingMs / 1e3);
    const typingWindow = pending.seenTypingSeconds || 6;
    const isSeen = remainingSeconds <= typingWindow && remainingSeconds > 0;
    const isTyping = isSeen;
    return {
      characterId,
      scheduledAt: pending.scheduledAt,
      delaySeconds: Math.round(pending.delayMs / 1e3),
      remainingSeconds,
      seenTypingSeconds: typingWindow,
      bucket: pending.bucket,
      isNight: pending.isNight,
      isTyping,
      isSeen
    };
  }
  getAllPending() {
    const result = {};
    for (const id of this.pendingMap.keys()) {
      const info = this.getInfo(id);
      if (info) result[id] = info;
    }
    return result;
  }
  async triggerImmediately(characterId, fallbackExecute) {
    if (this.activeExecutions.has(characterId)) {
      return await this.activeExecutions.get(characterId);
    }
    const pending = this.pendingMap.get(characterId);
    let executeFn = fallbackExecute;
    if (pending) {
      clearTimeout(pending.timer);
      executeFn = pending.onExecute;
      this.pendingMap.delete(characterId);
    }
    if (executeFn) {
      const promise = (async () => {
        try {
          return await executeFn();
        } catch (err) {
          console.error(`[ReplyScheduler] triggerImmediately execution error for ${characterId}:`, err);
          throw err;
        } finally {
          this.activeExecutions.delete(characterId);
        }
      })();
      this.activeExecutions.set(characterId, promise);
      return await promise;
    }
    return null;
  }
  cancel(characterId) {
    const pending = this.pendingMap.get(characterId);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingMap.delete(characterId);
    }
  }
};
var replyScheduler = new ReplyScheduler();

// server/src/index.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
dotenv.config();
dotenv.config({ path: path2.join(__dirname2, "..", ".env") });
dotenv.config({ path: path2.join(__dirname2, "..", "..", ".env") });
var app = express();
var server = http.createServer(app);
var PORT = process.env.PORT || 5e3;
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use((req, res, next) => {
  const queryUrl = req.query?.__url || req.query?.path;
  const forwardedUri = req.headers["x-forwarded-uri"];
  const vercelOriginalUrl = req.headers["x-vercel-original-url"];
  const matchedPath = req.headers["x-matched-path"];
  const validMatchedPath = matchedPath && !matchedPath.endsWith("index.js") && !matchedPath.endsWith("index") ? matchedPath : null;
  const resolvedPath = queryUrl || forwardedUri || vercelOriginalUrl || validMatchedPath;
  if (resolvedPath && resolvedPath.startsWith("/api")) {
    const queryIndex = req.url.indexOf("?");
    const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : "";
    req.url = resolvedPath + queryString;
  }
  next();
});
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "OnlyHer AI Companion API running",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await db.getSettings();
    const maskedKey = settings.apiKey ? `${settings.apiKey.slice(0, 4)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${settings.apiKey.slice(-4)}` : "";
    res.json({
      ...settings,
      apiKey: maskedKey,
      hasApiKey: Boolean(settings.apiKey && settings.apiKey.trim().length > 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/settings", async (req, res) => {
  try {
    const { apiKey, apiProvider, model, soundEnabled, theme, proactiveMessages, realisticDelays } = req.body;
    const current = await db.getSettings();
    const updates = {};
    if (apiKey !== void 0 && !apiKey.includes("\u2022\u2022\u2022\u2022")) {
      updates.apiKey = apiKey.trim();
    }
    if (apiProvider !== void 0) updates.apiProvider = apiProvider;
    if (model !== void 0) updates.model = model;
    if (soundEnabled !== void 0) updates.soundEnabled = soundEnabled;
    if (theme !== void 0) updates.theme = theme;
    if (proactiveMessages !== void 0) updates.proactiveMessages = proactiveMessages;
    if (realisticDelays !== void 0) updates.realisticDelays = realisticDelays;
    const updated = await db.updateSettings(updates);
    res.json({
      ...updated,
      apiKey: updated.apiKey ? `${updated.apiKey.slice(0, 4)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${updated.apiKey.slice(-4)}` : "",
      hasApiKey: Boolean(updated.apiKey && updated.apiKey.trim().length > 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/settings/test-key", async (req, res) => {
  try {
    const { apiKey, apiProvider } = req.body;
    let keyToTest = apiKey;
    if (!keyToTest || keyToTest.includes("\u2022\u2022\u2022\u2022")) {
      const current = await db.getSettings();
      keyToTest = current.apiKey;
    }
    const result = await aiService.testApiKey(keyToTest, apiProvider || "gemini");
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/characters", async (req, res) => {
  try {
    const characters = await db.getCharacters();
    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/characters/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const character = await db.getCharacterById(id);
    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }
    res.json(character);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/characters", async (req, res) => {
  try {
    const {
      name,
      handle,
      age,
      avatar,
      introduction,
      backstory,
      appearance,
      personality,
      behaviour_settings,
      communication_preferences
    } = req.body;
    if (!name || !avatar) {
      return res.status(400).json({ error: "Name and avatar are required." });
    }
    const parsedAge = Number(age) || 22;
    if (parsedAge < 18) {
      return res.status(400).json({ error: "Character age must be 18 or above." });
    }
    const computedHandle = handle ? String(handle).replace(/^@/, "").trim() : name.trim().toLowerCase().replace(/[^a-z0-9]/g, "_") || "companion";
    const cleanAvatar = String(avatar).trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
    const newChar = await db.createCharacter({
      user_id: "user-default",
      name: name.trim(),
      handle: computedHandle,
      has_story: true,
      age: parsedAge,
      avatar: cleanAvatar,
      introduction: introduction || `Hey there! I'm ${name.trim()}. So excited to chat with you! \u2728`,
      backstory: backstory || `${name.trim()} is an engaging and expressive companion who enjoys having meaningful conversations.`,
      appearance: appearance || {
        hairColor: "Brown",
        hairstyle: "Wavy",
        eyeColor: "Hazel",
        clothingStyle: "Casual chic",
        overallAppearance: "Charming and expressive"
      },
      personality: Array.isArray(personality) && personality.length > 0 ? personality : ["Caring and affectionate", "Funny and playful"],
      behaviour_settings: behaviour_settings || {
        affection: 75,
        romantic: 65,
        humour: 70,
        jealousy: 30,
        talkativeness: 75,
        expressiveness: 80,
        playfulness: 75
      },
      communication_preferences: communication_preferences || {
        language: "English",
        formality: "Casual",
        replyLength: "Balanced",
        useEmojis: true
      },
      relationship_level: 1,
      relationship_title: "Acquaintance",
      xp: 0,
      proactive_enabled: true,
      is_online: true,
      custom_status: "online and thinking of you \u2728"
    });
    try {
      await db.addMessage({
        character_id: newChar.id,
        user_id: "user-default",
        sender: "girlfriend",
        message: newChar.introduction,
        status: "read"
      });
    } catch (msgErr) {
      console.warn("Initial greeting message failed to write to db:", msgErr);
    }
    res.status(201).json(newChar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/characters/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await db.updateCharacter(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Character not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/characters/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const success = await db.deleteCharacter(id);
    if (!success) {
      return res.status(404).json({ error: "Character not found" });
    }
    res.json({ success: true, message: "Character and all associated data deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/characters/:id/messages", async (req, res) => {
  try {
    const id = req.params.id;
    await replyScheduler.checkAndExecutePending(id);
    const messages = await db.getMessages(id);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
async function generateAndSaveCompanionReply(characterId, mediaUrl) {
  const character = await db.getCharacterById(characterId);
  if (!character) throw new Error("Character not found");
  const [memories, history, settings] = await Promise.all([
    db.getMemories(characterId),
    db.getMessages(characterId),
    db.getSettings()
  ]);
  const lastMsg = history[history.length - 1];
  if (lastMsg && lastMsg.sender === "girlfriend") {
    return {
      aiMessage: lastMsg
    };
  }
  const userMsgs = history.filter((m) => m.sender === "user");
  const latestUser = userMsgs[userMsgs.length - 1];
  const promptText = latestUser?.message || "Hey there!";
  const aiResponse = await aiService.generateReply(
    character,
    memories,
    history,
    promptText,
    settings,
    mediaUrl
  );
  const girlfriendMsg = await db.addMessage({
    character_id: characterId,
    user_id: "user-default",
    sender: "girlfriend",
    message: aiResponse.reply,
    status: "read"
  });
  let newMemoryRecord;
  if (aiResponse.extractedMemory) {
    newMemoryRecord = await db.addMemory({
      character_id: characterId,
      category: aiResponse.extractedMemory.category,
      memory_content: aiResponse.extractedMemory.memory_content,
      importance: aiResponse.extractedMemory.importance
    });
  }
  const relationshipUpdate = await db.recordConversationXP(characterId, 30);
  return {
    aiMessage: girlfriendMsg,
    newMemory: newMemoryRecord,
    relationshipUpdate
  };
}
app.post("/api/characters/:id/messages", async (req, res) => {
  try {
    const characterId = req.params.id;
    const { message, media_url, media_type, clientHour, forceInstant } = req.body;
    if (!message && !media_url) {
      return res.status(400).json({ error: "Message text or media is required" });
    }
    const character = await db.getCharacterById(characterId);
    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }
    const userMsg = await db.addMessage({
      character_id: characterId,
      user_id: "user-default",
      sender: "user",
      message: message || (media_type === "image" ? "\u{1F4F7} [Photo]" : "\u{1F3B5} [Voice Note]"),
      media_url,
      media_type,
      status: "delivered"
    });
    const settings = await db.getSettings();
    const useRealisticDelays = settings.realisticDelays !== false && !forceInstant;
    if (forceInstant) {
      try {
        const replyResult = await generateAndSaveCompanionReply(characterId, media_url);
        await db.updateMessageStatus(userMsg.id, "read");
        return res.json({
          userMessage: userMsg,
          ...replyResult
        });
      } catch (aiErr) {
        if (aiErr.code === "NO_API_KEY") {
          return res.status(400).json({
            error: "NO_API_KEY",
            message: aiErr.message,
            userMessage: userMsg
          });
        }
        if (aiErr.code === "INVALID_API_KEY") {
          return res.status(401).json({
            error: "INVALID_API_KEY",
            message: aiErr.message,
            userMessage: userMsg
          });
        }
        return res.status(500).json({
          error: "AI_ERROR",
          message: aiErr.message || "Failed to generate AI companion response.",
          userMessage: userMsg
        });
      }
    }
    const [memories, history] = await Promise.all([
      db.getMemories(characterId),
      db.getMessages(characterId)
    ]);
    let aiResponse;
    try {
      aiResponse = await aiService.generateReply(
        character,
        memories,
        history,
        userMsg.message,
        settings,
        media_url
      );
    } catch (aiErr) {
      if (aiErr.code === "NO_API_KEY") {
        return res.status(400).json({
          error: "NO_API_KEY",
          message: aiErr.message,
          userMessage: userMsg
        });
      }
      if (aiErr.code === "INVALID_API_KEY") {
        return res.status(401).json({
          error: "INVALID_API_KEY",
          message: aiErr.message,
          userMessage: userMsg
        });
      }
      return res.status(500).json({
        error: "AI_ERROR",
        message: aiErr.message || "Failed to generate AI companion response.",
        userMessage: userMsg
      });
    }
    const wordCount = aiResponse.reply.trim().split(/\s+/).filter(Boolean).length;
    const { delayMs, seenTypingSeconds, bucket, isNight, description } = calculateReplyDelay({
      clientHour: typeof clientHour === "number" ? clientHour : void 0,
      realisticDelaysEnabled: useRealisticDelays,
      wordCount
    });
    console.log(`[Realistic Delay] ${character.name}: reply scheduled in ${Math.round(delayMs / 1e3)}s (${description})`);
    const pendingReply = replyScheduler.scheduleReply(
      characterId,
      delayMs,
      seenTypingSeconds,
      bucket,
      isNight,
      async () => {
        try {
          const girlfriendMsg = await db.addMessage({
            character_id: characterId,
            user_id: "user-default",
            sender: "girlfriend",
            message: aiResponse.reply,
            status: "read"
          });
          await db.updateMessageStatus(userMsg.id, "read");
          let newMemoryRecord;
          if (aiResponse.extractedMemory) {
            newMemoryRecord = await db.addMemory({
              character_id: characterId,
              category: aiResponse.extractedMemory.category,
              memory_content: aiResponse.extractedMemory.memory_content,
              importance: aiResponse.extractedMemory.importance
            });
          }
          const relationshipUpdate = await db.recordConversationXP(characterId, 30);
          console.log(`[Realistic Delay] ${character.name}: scheduled reply delivered (${wordCount} words, typed ${seenTypingSeconds}s).`);
          return {
            aiMessage: girlfriendMsg,
            newMemory: newMemoryRecord,
            relationshipUpdate
          };
        } catch (err) {
          console.error(`[Realistic Delay] Error saving scheduled reply for ${character.name}:`, err.message || err);
        }
      }
    );
    return res.json({
      userMessage: userMsg,
      pendingReply
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/characters/:id/reply-status", async (req, res) => {
  const characterId = req.params.id;
  await replyScheduler.checkAndExecutePending(characterId);
  const pendingReply = replyScheduler.getInfo(characterId);
  res.json({ pendingReply });
});
app.post("/api/characters/:id/skip-delay", async (req, res) => {
  try {
    const characterId = req.params.id;
    const result = await replyScheduler.triggerImmediately(
      characterId,
      () => generateAndSaveCompanionReply(characterId)
    );
    res.json(result || { success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/pending-replies", (req, res) => {
  res.json(replyScheduler.getAllPending());
});
app.delete("/api/characters/:id/messages", async (req, res) => {
  try {
    const id = req.params.id;
    await db.clearMessages(id);
    res.json({ success: true, message: "Chat history cleared." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/characters/:id/messages/:messageId/like", async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const updated = await db.toggleMessageLike(messageId);
    if (!updated) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/characters/:id/memories", async (req, res) => {
  try {
    const id = req.params.id;
    const memories = await db.getMemories(id);
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/characters/:id/memories", async (req, res) => {
  try {
    const id = req.params.id;
    const { memory_content, category, importance } = req.body;
    if (!memory_content) {
      return res.status(400).json({ error: "Memory content is required" });
    }
    const mem = await db.addMemory({
      character_id: id,
      memory_content: memory_content.trim(),
      category: category || "general",
      importance: Number(importance) || 3
    });
    res.status(201).json(mem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/characters/:id/memories/:memoryId", async (req, res) => {
  try {
    const memoryId = req.params.memoryId;
    const updated = await db.updateMemory(memoryId, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Memory not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/characters/:id/memories/:memoryId", async (req, res) => {
  try {
    const memoryId = req.params.memoryId;
    const success = await db.deleteMemory(memoryId);
    if (!success) {
      return res.status(404).json({ error: "Memory not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/characters/:id/proactive", async (req, res) => {
  try {
    const characterId = req.params.id;
    const character = await db.getCharacterById(characterId);
    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }
    const [memories, settings] = await Promise.all([
      db.getMemories(characterId),
      db.getSettings()
    ]);
    const text = await aiService.generateProactiveMessage(character, memories, settings);
    const girlfriendMsg = await db.addMessage({
      character_id: characterId,
      user_id: "user-default",
      sender: "girlfriend",
      message: text,
      status: "delivered"
    });
    res.json(girlfriendMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var clientDist = path2.join(__dirname2, "..", "..", "client", "dist");
if (!process.env.VERCEL) {
  app.use(express.static(clientDist));
  app.use((req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Endpoint not found" });
    }
    res.sendFile(path2.join(clientDist, "index.html"));
  });
  server.listen(PORT, () => {
    console.log(`\u{1F680} OnlyHer AI Companion running at http://localhost:${PORT}`);
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl || req.url}` });
  });
}
var index_default = app;
export {
  index_default as default
};
