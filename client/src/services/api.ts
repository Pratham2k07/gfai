import { Character, Message, Memory, AppSettings, PendingReplyInfo } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : '') + '/api';

export const DEFAULT_SEED_CHARACTERS: Character[] = [
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
      affection: 75,
      romantic: 85,
      humour: 60,
      jealousy: 20,
      talkativeness: 70,
      expressiveness: 80,
      playfulness: 65
    },
    communication_preferences: {
      language: 'English',
      formality: 'Casual',
      replyLength: 'Detailed',
      useEmojis: true
    },
    relationship_level: 1,
    relationship_title: 'Acquaintance',
    xp: 60,
    proactive_enabled: true,
    is_online: true,
    has_story: true,
    custom_status: 'reading Simone de Beauvoir 📖',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString()
  }
];

function getStoredCharacters(): Character[] {
  try {
    const raw = localStorage.getItem('velora_saved_characters');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

function saveCharactersLocally(chars: Character[]) {
  try {
    localStorage.setItem('velora_saved_characters', JSON.stringify(chars));
  } catch {}
}

export function saveSingleCharacterLocally(char: Character) {
  const existing = getStoredCharacters();
  const filtered = existing.filter(c => c.id !== char.id);
  const updated = [char, ...filtered];
  saveCharactersLocally(updated);
}

export async function fetchCharacters(): Promise<Character[]> {
  try {
    const res = await fetch(`${API_BASE}/characters`);
    if (res.ok) {
      const serverChars: Character[] = await res.json();
      if (Array.isArray(serverChars) && serverChars.length > 0) {
        // Merge with any locally created custom characters not yet on server
        const localChars = getStoredCharacters();
        const merged = [...serverChars];
        for (const lc of localChars) {
          if (!merged.some(sc => sc.id === lc.id)) {
            merged.push(lc);
          }
        }
        saveCharactersLocally(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('fetchCharacters API unavailable, using locally cached companions:', err);
  }

  return getStoredCharacters();
}

export async function fetchCharacter(id: string): Promise<Character> {
  try {
    const res = await fetch(`${API_BASE}/characters/${id}`);
    if (res.ok) return await res.json();
  } catch {}
  const all = getStoredCharacters();
  const match = all.find(c => c.id === id);
  if (match) return match;
  throw new Error('Character not found');
}

export async function createCharacter(character: Partial<Character>): Promise<Character> {
  const fallbackId = `char-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const cleanName = character.name?.trim() || 'Girlfriend';
  const cleanHandle = character.handle?.trim() || cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'companion';
  const cleanAvatar = character.avatar?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
  const cleanIntro = character.introduction?.trim() || `Hey! So glad we finally matched on Instagram. How is your day going? 💕`;
  const cleanBackstory = character.backstory?.trim() || `${cleanName} is an expressive, loving companion who enjoys chatting with you in Instagram DMs.`;

  const fallbackCharacter: Character = {
    id: fallbackId,
    user_id: character.user_id || 'user-default',
    name: cleanName,
    handle: cleanHandle,
    has_story: true,
    age: Number(character.age) || 22,
    avatar: cleanAvatar,
    introduction: cleanIntro,
    backstory: cleanBackstory,
    appearance: character.appearance || {
      hairColor: 'Dark Chestnut',
      hairstyle: 'Soft wavy shoulder-length',
      eyeColor: 'Deep Brown',
      clothingStyle: 'Cozy chic oversized hoodies and denim',
      overallAppearance: 'Charming and expressive'
    },
    personality: Array.isArray(character.personality) && character.personality.length > 0
      ? character.personality
      : ['Caring and affectionate', 'Funny and playful'],
    behaviour_settings: character.behaviour_settings || {
      affection: 80,
      romantic: 70,
      humour: 75,
      jealousy: 35,
      talkativeness: 80,
      expressiveness: 85,
      playfulness: 80
    },
    communication_preferences: character.communication_preferences || {
      language: 'English',
      formality: 'Casual',
      replyLength: 'Balanced',
      useEmojis: true
    },
    relationship_level: 1,
    relationship_title: 'Acquaintance',
    xp: 0,
    proactive_enabled: true,
    is_online: true,
    custom_status: 'online and thinking of you ✨',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const res = await fetch(`${API_BASE}/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...fallbackCharacter,
        ...character,
        name: cleanName,
        handle: cleanHandle,
        avatar: cleanAvatar,
        introduction: cleanIntro,
        backstory: cleanBackstory
      }),
    });
    if (res.ok) {
      const serverChar = await res.json();
      saveSingleCharacterLocally(serverChar);
      return serverChar;
    }
    console.warn(`createCharacter server returned ${res.status}, continuing with local companion`);
  } catch (err) {
    console.warn('createCharacter network error, continuing with local companion:', err);
  }

  // Graceful offline/local companion creation fallback so user is NEVER blocked from entering DM
  saveSingleCharacterLocally(fallbackCharacter);

  // Seed local opening greeting message
  try {
    const localMsgsRaw = localStorage.getItem(`velora_msgs_${fallbackCharacter.id}`);
    const localMsgs = localMsgsRaw ? JSON.parse(localMsgsRaw) : [];
    if (localMsgs.length === 0) {
      localMsgs.push({
        id: `msg-welcome-${Date.now()}`,
        character_id: fallbackCharacter.id,
        user_id: 'user-default',
        sender: 'girlfriend',
        message: fallbackCharacter.introduction,
        status: 'read',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(`velora_msgs_${fallbackCharacter.id}`, JSON.stringify(localMsgs));
    }
  } catch {}

  return fallbackCharacter;
}

export async function updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
  try {
    const res = await fetch(`${API_BASE}/characters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      saveSingleCharacterLocally(updated);
      return updated;
    }
  } catch {}

  const all = getStoredCharacters();
  const index = all.findIndex(c => c.id === id);
  if (index !== -1) {
    all[index] = { ...all[index], ...updates, updated_at: new Date().toISOString() };
    saveCharactersLocally(all);
    return all[index];
  }
  throw new Error('Failed to update character');
}

export async function deleteCharacter(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/characters/${id}`, { method: 'DELETE' });
  } catch {}
  const all = getStoredCharacters().filter(c => c.id !== id);
  saveCharactersLocally(all);
  try {
    localStorage.removeItem(`velora_msgs_${id}`);
    localStorage.removeItem(`velora_mems_${id}`);
  } catch {}
}

export async function fetchMessages(characterId: string): Promise<Message[]> {
  try {
    const res = await fetch(`${API_BASE}/characters/${characterId}/messages`);
    if (res.ok) {
      const msgs = await res.json();
      if (Array.isArray(msgs) && msgs.length > 0) {
        try {
          localStorage.setItem(`velora_msgs_${characterId}`, JSON.stringify(msgs));
        } catch {}
        return msgs;
      }
    }
  } catch {}

  try {
    const localMsgsRaw = localStorage.getItem(`velora_msgs_${characterId}`);
    if (localMsgsRaw) {
      const parsed = JSON.parse(localMsgsRaw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return [];
}

export async function sendMessage(
  characterId: string,
  payload: { message?: string; media_url?: string; media_type?: 'image' | 'audio'; clientHour?: number; forceInstant?: boolean }
): Promise<{
  userMessage: Message;
  aiMessage?: Message;
  pendingReply?: PendingReplyInfo;
  newMemory?: Memory;
  relationshipUpdate?: { level: number; title: string; xp: number; leveledUp: boolean };
}> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      clientHour: payload.clientHour ?? new Date().getHours()
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const error: any = new Error(data.message || data.error || 'Failed to send message');
    error.code = data.error;
    error.userMessage = data.userMessage;
    throw error;
  }
  return data;
}

export async function fetchReplyStatus(characterId: string): Promise<{ pendingReply: PendingReplyInfo | null }> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/reply-status`);
  if (!res.ok) throw new Error('Failed to fetch reply status');
  return res.json();
}

export async function skipReplyDelay(characterId: string): Promise<{
  aiMessage: Message;
  newMemory?: Memory;
  relationshipUpdate?: { level: number; title: string; xp: number; leveledUp: boolean };
}> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/skip-delay`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to skip delay');
  return res.json();
}

export async function fetchAllPendingReplies(): Promise<Record<string, PendingReplyInfo>> {
  try {
    const res = await fetch(`${API_BASE}/pending-replies`);
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export async function clearChatHistory(characterId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/characters/${characterId}/messages`, { method: 'DELETE' });
  } catch {}
  try {
    localStorage.removeItem(`velora_msgs_${characterId}`);
  } catch {}
}

export async function toggleMessageLike(characterId: string, messageId: string): Promise<Message> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/messages/${messageId}/like`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to toggle like');
  return res.json();
}

export async function fetchMemories(characterId: string): Promise<Memory[]> {
  try {
    const res = await fetch(`${API_BASE}/characters/${characterId}/memories`);
    if (res.ok) return res.json();
  } catch {}
  return [];
}

export async function addMemory(characterId: string, memory: { memory_content: string; category: string; importance: number }): Promise<Memory> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/memories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memory),
  });
  if (!res.ok) throw new Error('Failed to add memory');
  return res.json();
}

export async function updateMemory(characterId: string, memoryId: string, memory: Partial<Memory>): Promise<Memory> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/memories/${memoryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memory),
  });
  if (!res.ok) throw new Error('Failed to update memory');
  return res.json();
}

export async function deleteMemory(characterId: string, memoryId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/memories/${memoryId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete memory');
}

export async function fetchSettings(): Promise<AppSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function testApiKey(apiKey: string, apiProvider: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/settings/test-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, apiProvider }),
  });
  return res.json();
}

export async function triggerProactiveMessage(characterId: string): Promise<Message> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/proactive`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger proactive message');
  return res.json();
}
