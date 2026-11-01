import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { aiService } from './aiService.js';
import { Character, Message } from './types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// --- Health ---
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Settings ---
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const settings = await db.getSettings();
    // Mask API key for security so it is never exposed in plain text
    const maskedKey = settings.apiKey
      ? `${settings.apiKey.slice(0, 4)}••••••••${settings.apiKey.slice(-4)}`
      : '';
    res.json({
      ...settings,
      apiKey: maskedKey,
      hasApiKey: Boolean(settings.apiKey && settings.apiKey.trim().length > 0)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req: Request, res: Response) => {
  try {
    const { apiKey, apiProvider, model, soundEnabled, theme, proactiveMessages } = req.body;
    const current = await db.getSettings();

    const updates: any = {};
    if (apiKey !== undefined && !apiKey.includes('••••')) {
      updates.apiKey = apiKey.trim();
    }
    if (apiProvider !== undefined) updates.apiProvider = apiProvider;
    if (model !== undefined) updates.model = model;
    if (soundEnabled !== undefined) updates.soundEnabled = soundEnabled;
    if (theme !== undefined) updates.theme = theme;
    if (proactiveMessages !== undefined) updates.proactiveMessages = proactiveMessages;

    const updated = await db.updateSettings(updates);
    res.json({
      ...updated,
      apiKey: updated.apiKey ? `${updated.apiKey.slice(0, 4)}••••••••${updated.apiKey.slice(-4)}` : '',
      hasApiKey: Boolean(updated.apiKey && updated.apiKey.trim().length > 0)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/test-key', async (req: Request, res: Response) => {
  try {
    const { apiKey, apiProvider } = req.body;
    let keyToTest = apiKey;
    if (!keyToTest || keyToTest.includes('••••')) {
      const current = await db.getSettings();
      keyToTest = current.apiKey;
    }
    const result = await aiService.testApiKey(keyToTest, apiProvider || 'gemini');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Characters ---
app.get('/api/characters', async (req: Request, res: Response) => {
  try {
    const characters = await db.getCharacters();
    res.json(characters);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/characters/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const character = await db.getCharacterById(id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.json(character);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/characters', async (req: Request, res: Response) => {
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

    if (!name || !age || !avatar) {
      return res.status(400).json({ error: 'Name, age (18+), and avatar are required.' });
    }

    if (Number(age) < 18) {
      return res.status(400).json({ error: 'Character age must be 18 or above.' });
    }

    const computedHandle = handle ? String(handle).replace(/^@/, '').trim() : name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

    const newChar = await db.createCharacter({
      user_id: 'user-default',
      name: name.trim(),
      handle: computedHandle,
      has_story: true,
      age: Number(age),
      avatar: avatar.trim(),
      introduction: introduction || `Hey there! I'm ${name.trim()}. So excited to chat with you! ✨`,
      backstory: backstory || `${name.trim()} is an engaging and expressive companion who enjoys having meaningful conversations.`,
      appearance: appearance || {
        hairColor: 'Brown',
        hairstyle: 'Wavy',
        eyeColor: 'Hazel',
        clothingStyle: 'Casual chic',
        overallAppearance: 'Charming and expressive'
      },
      personality: Array.isArray(personality) && personality.length > 0 ? personality : ['Caring and affectionate', 'Funny and playful'],
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
      custom_status: 'online and thinking of you ✨'
    });

    // Automatically send initial greeting message from the girlfriend!
    await db.addMessage({
      character_id: newChar.id,
      user_id: 'user-default',
      sender: 'girlfriend',
      message: newChar.introduction,
      status: 'read'
    });

    res.status(201).json(newChar);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/characters/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await db.updateCharacter(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/characters/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const success = await db.deleteCharacter(id);
    if (!success) {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.json({ success: true, message: 'Character and all associated data deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Messages & Chat ---
app.get('/api/characters/:id/messages', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const messages = await db.getMessages(id);
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/characters/:id/messages', async (req: Request, res: Response) => {
  try {
    const characterId = req.params.id as string;
    const { message, media_url, media_type } = req.body;

    if (!message && !media_url) {
      return res.status(400).json({ error: 'Message text or media is required' });
    }

    const character = await db.getCharacterById(characterId);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // 1. Record user message
    const userMsg = await db.addMessage({
      character_id: characterId,
      user_id: 'user-default',
      sender: 'user',
      message: message || (media_type === 'image' ? '📷 [Photo]' : '🎵 [Voice Note]'),
      media_url,
      media_type,
      status: 'sent'
    });

    // 2. Fetch context (memories & history)
    const [memories, history, settings] = await Promise.all([
      db.getMemories(characterId),
      db.getMessages(characterId),
      db.getSettings()
    ]);

    // 3. Generate AI response
    let aiResponse;
    try {
      aiResponse = await aiService.generateReply(
        character,
        memories,
        history,
        message || "Here is a photo I wanted to share with you!",
        settings,
        media_url
      );
    } catch (aiErr: any) {
      if (aiErr.code === 'NO_API_KEY') {
        return res.status(400).json({
          error: 'NO_API_KEY',
          message: aiErr.message,
          userMessage: userMsg
        });
      }
      if (aiErr.code === 'INVALID_API_KEY') {
        return res.status(401).json({
          error: 'INVALID_API_KEY',
          message: aiErr.message,
          userMessage: userMsg
        });
      }
      return res.status(500).json({
        error: 'AI_ERROR',
        message: aiErr.message || 'Failed to generate AI companion response.',
        userMessage: userMsg
      });
    }

    // 4. Save girlfriend message
    const girlfriendMsg = await db.addMessage({
      character_id: characterId,
      user_id: 'user-default',
      sender: 'girlfriend',
      message: aiResponse.reply,
      status: 'read'
    });

    // 5. If new memory extracted, save it
    let newMemoryRecord;
    if (aiResponse.extractedMemory) {
      newMemoryRecord = await db.addMemory({
        character_id: characterId,
        category: aiResponse.extractedMemory.category,
        memory_content: aiResponse.extractedMemory.memory_content,
        importance: aiResponse.extractedMemory.importance
      });
    }

    // 6. Record XP and relationship progression
    const relationshipUpdate = await db.recordConversationXP(characterId, 30);

    res.json({
      userMessage: userMsg,
      aiMessage: girlfriendMsg,
      newMemory: newMemoryRecord,
      relationshipUpdate
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/characters/:id/messages', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await db.clearMessages(id);
    res.json({ success: true, message: 'Chat history cleared.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/characters/:id/messages/:messageId/like', async (req: Request, res: Response) => {
  try {
    const messageId = req.params.messageId as string;
    const updated = await db.toggleMessageLike(messageId);
    if (!updated) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Memories Management ---
app.get('/api/characters/:id/memories', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const memories = await db.getMemories(id);
    res.json(memories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/characters/:id/memories', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { memory_content, category, importance } = req.body;
    if (!memory_content) {
      return res.status(400).json({ error: 'Memory content is required' });
    }
    const mem = await db.addMemory({
      character_id: id,
      memory_content: memory_content.trim(),
      category: category || 'general',
      importance: Number(importance) || 3
    });
    res.status(201).json(mem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/characters/:id/memories/:memoryId', async (req: Request, res: Response) => {
  try {
    const memoryId = req.params.memoryId as string;
    const updated = await db.updateMemory(memoryId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/characters/:id/memories/:memoryId', async (req: Request, res: Response) => {
  try {
    const memoryId = req.params.memoryId as string;
    const success = await db.deleteMemory(memoryId);
    if (!success) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Proactive Message Trigger ---
app.post('/api/characters/:id/proactive', async (req: Request, res: Response) => {
  try {
    const characterId = req.params.id as string;
    const character = await db.getCharacterById(characterId);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    const [memories, settings] = await Promise.all([
      db.getMemories(characterId),
      db.getSettings()
    ]);

    const text = await aiService.generateProactiveMessage(character, memories, settings);
    const girlfriendMsg = await db.addMessage({
      character_id: characterId,
      user_id: 'user-default',
      sender: 'girlfriend',
      message: text,
      status: 'delivered'
    });

    res.json(girlfriendMsg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve client build if available
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.use((req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send("AI Companion Backend is running. Frontend dev server is at http://localhost:3000");
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Companion Server running at http://localhost:${PORT}`);
});
