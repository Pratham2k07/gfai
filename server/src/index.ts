import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { db } from './db.js';
import { aiService } from './aiService.js';
import { Character, Message } from './types.js';
import { replyScheduler, calculateReplyDelay } from './replyScheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server dir, root dir, or cwd
dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Vercel serverless environment URL normalization
app.use((req: Request, res: Response, next) => {
  const queryUrl = (req.query?.__url as string) || (req.query?.path as string);
  const forwardedUri = req.headers['x-forwarded-uri'] as string;
  const vercelOriginalUrl = req.headers['x-vercel-original-url'] as string;
  const matchedPath = req.headers['x-matched-path'] as string;

  // matchedPath is /api/index.js in Vercel lambda - only use if it's an actual endpoint route
  const validMatchedPath = (matchedPath && !matchedPath.endsWith('index.js') && !matchedPath.endsWith('index')) ? matchedPath : null;

  const resolvedPath = queryUrl || forwardedUri || vercelOriginalUrl || validMatchedPath;

  if (resolvedPath && resolvedPath.startsWith('/api')) {
    const queryIndex = req.url.indexOf('?');
    const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : '';
    req.url = resolvedPath + queryString;
  }
  next();
});

// --- Base API Status ---
app.get('/api', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'OnlyHer AI Companion API running',
    timestamp: new Date().toISOString()
  });
});

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
    const { apiKey, apiProvider, model, soundEnabled, theme, proactiveMessages, realisticDelays } = req.body;
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
    if (realisticDelays !== undefined) updates.realisticDelays = realisticDelays;

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

    if (!name || !avatar) {
      return res.status(400).json({ error: 'Name and avatar are required.' });
    }

    const parsedAge = Number(age) || 22;
    if (parsedAge < 18) {
      return res.status(400).json({ error: 'Character age must be 18 or above.' });
    }

    const computedHandle = handle
      ? String(handle).replace(/^@/, '').trim()
      : name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'companion';

    const cleanAvatar = String(avatar).trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

    const newChar = await db.createCharacter({
      user_id: 'user-default',
      name: name.trim(),
      handle: computedHandle,
      has_story: true,
      age: parsedAge,
      avatar: cleanAvatar,
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
    try {
      await db.addMessage({
        character_id: newChar.id,
        user_id: 'user-default',
        sender: 'girlfriend',
        message: newChar.introduction,
        status: 'read'
      });
    } catch (msgErr) {
      console.warn('Initial greeting message failed to write to db:', msgErr);
    }

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
    await replyScheduler.checkAndExecutePending(id);
    const messages = await db.getMessages(id);
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to generate AI companion reply and update memories & XP
async function generateAndSaveCompanionReply(characterId: string, mediaUrl?: string) {
  const character = await db.getCharacterById(characterId);
  if (!character) throw new Error('Character not found');

  const [memories, history, settings] = await Promise.all([
    db.getMemories(characterId),
    db.getMessages(characterId),
    db.getSettings()
  ]);

  // If the last message is already from girlfriend, it was already generated/saved. Return it to prevent duplicate replies.
  const lastMsg = history[history.length - 1];
  if (lastMsg && lastMsg.sender === 'girlfriend') {
    return {
      aiMessage: lastMsg
    };
  }

  const userMsgs = history.filter(m => m.sender === 'user');
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
    user_id: 'user-default',
    sender: 'girlfriend',
    message: aiResponse.reply,
    status: 'read'
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

app.post('/api/characters/:id/messages', async (req: Request, res: Response) => {
  try {
    const characterId = req.params.id as string;
    const { message, media_url, media_type, clientHour, forceInstant } = req.body;

    if (!message && !media_url) {
      return res.status(400).json({ error: 'Message text or media is required' });
    }

    const character = await db.getCharacterById(characterId);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // 1. Record user message immediately (delivered status)
    const userMsg = await db.addMessage({
      character_id: characterId,
      user_id: 'user-default',
      sender: 'user',
      message: message || (media_type === 'image' ? '📷 [Photo]' : '🎵 [Voice Note]'),
      media_url,
      media_type,
      status: 'delivered'
    });

    const settings = await db.getSettings();

    // Check if realistic delays are enabled (defaults to true)
    const useRealisticDelays = settings.realisticDelays !== false && !forceInstant;

    if (forceInstant) {
      // Immediate reply generation requested explicitly
      try {
        const replyResult = await generateAndSaveCompanionReply(characterId, media_url);
        await db.updateMessageStatus(userMsg.id, 'read');
        return res.json({
          userMessage: userMsg,
          ...replyResult
        });
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
    }

    // 2. Pre-generate AI companion reply:
    // - Immediate validation of API keys and prompt safety
    // - Accurate word count for typing duration (seenTypingSeconds <= 10s)
    // - Zero latency delivery once countdown expires
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

    const wordCount = aiResponse.reply.trim().split(/\s+/).filter(Boolean).length;

    // 3. Realistic delay timing calculation:
    // - Night (10 PM - 6 AM): 15-20s total, typing in final 4-8s
    // - Day (6 AM - 10 PM): 25-120s total (max 2 min), typing in final 4-10s
    // - Once 'seen', reply arrives strictly within 10 seconds!
    const { delayMs, seenTypingSeconds, bucket, isNight, description } = calculateReplyDelay({
      clientHour: typeof clientHour === 'number' ? clientHour : undefined,
      realisticDelaysEnabled: useRealisticDelays,
      wordCount
    });

    console.log(`[Realistic Delay] ${character.name}: reply scheduled in ${Math.round(delayMs / 1000)}s (${description})`);

    // 4. Schedule background reply delivery
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
            user_id: 'user-default',
            sender: 'girlfriend',
            message: aiResponse.reply,
            status: 'read'
          });

          // Mark user's message as seen/read
          await db.updateMessageStatus(userMsg.id, 'read');

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
        } catch (err: any) {
          console.error(`[Realistic Delay] Error saving scheduled reply for ${character.name}:`, err.message || err);
        }
      }
    );

    return res.json({
      userMessage: userMsg,
      pendingReply
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check status of a pending reply for a specific character
app.get('/api/characters/:id/reply-status', async (req: Request, res: Response) => {
  const characterId = req.params.id as string;
  await replyScheduler.checkAndExecutePending(characterId);
  const pendingReply = replyScheduler.getInfo(characterId);
  res.json({ pendingReply });
});

// Force skip/trigger pending reply immediately (useful for testing or impatience)
app.post('/api/characters/:id/skip-delay', async (req: Request, res: Response) => {
  try {
    const characterId = req.params.id as string;
    const result = await replyScheduler.triggerImmediately(characterId, () =>
      generateAndSaveCompanionReply(characterId)
    );
    res.json(result || { success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active pending replies across all companions
app.get('/api/pending-replies', (req: Request, res: Response) => {
  res.json(replyScheduler.getAllPending());
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

// Serve built frontend and API on the same port (for local / standalone production)
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');

if (!process.env.VERCEL) {
  app.use(express.static(clientDist));
  app.use((req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  server.listen(PORT, () => {
    console.log(`🚀 OnlyHer AI Companion running at http://localhost:${PORT}`);
  });
} else {
  // On Vercel, static frontend is served by Vercel CDN; API handles unmapped routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl || req.url}` });
  });
}

export default app;
