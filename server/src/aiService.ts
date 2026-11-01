import { GoogleGenAI } from '@google/genai';
import { Character, Memory, Message, AppSettings } from './types.js';
import { buildSystemPrompt } from './promptBuilder.js';

export interface AIServiceResponse {
  reply: string;
  extractedMemory?: {
    category: 'personal' | 'preference' | 'hobby' | 'event' | 'inside_joke' | 'general';
    memory_content: string;
    importance: number;
  };
}

export class AIService {
  /**
   * Generates a realistic girlfriend chat reply using configured LLM.
   */
  async generateReply(
    character: Character,
    memories: Memory[],
    history: Message[],
    incomingMessage: string,
    settings: AppSettings,
    imageUrl?: string
  ): Promise<AIServiceResponse> {
    const apiKey = settings.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      const err: any = new Error("NO_API_KEY");
      err.code = "NO_API_KEY";
      err.message = "AI API Key is not configured. Please enter your Gemini or OpenAI API key in Settings to activate realistic AI conversation.";
      throw err;
    }

    const systemPrompt = buildSystemPrompt(character, memories);

    if (settings.apiProvider === 'openai' || settings.apiProvider === 'groq' || settings.apiProvider === 'openrouter') {
      return this.generateOpenAICompatible(systemPrompt, history, incomingMessage, settings, apiKey);
    } else {
      return this.generateGemini(systemPrompt, history, incomingMessage, settings, apiKey, imageUrl);
    }
  }

  /**
   * Gemini implementation via official Google Gen AI SDK
   */
  private async generateGemini(
    systemPrompt: string,
    history: Message[],
    incomingMessage: string,
    settings: AppSettings,
    apiKey: string,
    imageUrl?: string
  ): Promise<AIServiceResponse> {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = settings.model || 'gemini-1.5-flash';

    // Format conversation history for Gemini
    // Limit to last 16 turns to keep context fast and fresh
    const recentHistory = history.slice(-16);
    const contents: any[] = [];

    for (const msg of recentHistory) {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message }]
      });
    }

    // Current user message
    const userParts: any[] = [{ text: incomingMessage }];
    if (imageUrl) {
      userParts.push({ text: `[Sent an image]: ${imageUrl}` });
    }

    contents.push({
      role: 'user',
      parts: userParts
    });

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.9,
          maxOutputTokens: 600,
        }
      });

      const reply = response.text?.trim() || "Hey... I got a little distracted, what did you just say? 💕";

      // Attempt light background memory extraction if user shared something personal
      const extractedMemory = await this.extractMemoryGemini(ai, modelName, incomingMessage);

      return { reply, extractedMemory };
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (error?.status === 400 || error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("API key not valid")) {
        const err: any = new Error("INVALID_API_KEY");
        err.code = "INVALID_API_KEY";
        err.message = "The provided Gemini API key appears invalid or expired. Please check your key in Settings.";
        throw err;
      }
      throw error;
    }
  }

  /**
   * OpenAI/Groq/OpenRouter implementation
   */
  private async generateOpenAICompatible(
    systemPrompt: string,
    history: Message[],
    incomingMessage: string,
    settings: AppSettings,
    apiKey: string
  ): Promise<AIServiceResponse> {
    let baseUrl = 'https://api.openai.com/v1/chat/completions';
    let defaultModel = 'gpt-4o-mini';

    if (settings.apiProvider === 'groq') {
      baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
      defaultModel = 'llama-3.3-70b-versatile';
    } else if (settings.apiProvider === 'openrouter') {
      baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
      defaultModel = 'meta-llama/llama-3.3-70b-instruct';
    }

    const model = settings.model || defaultModel;
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    const recentHistory = history.slice(-16);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message
      });
    }

    messages.push({
      role: 'user',
      content: incomingMessage
    });

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.9,
        max_tokens: 500
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const err: any = new Error(errData?.error?.message || `HTTP ${res.status} error from ${settings.apiProvider}`);
      err.code = "API_ERROR";
      throw err;
    }

    const data: any = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "... 💕";

    return { reply };
  }

  /**
   * Lightweight automatic memory detection
   */
  private async extractMemoryGemini(ai: GoogleGenAI, modelName: string, userMessage: string) {
    if (userMessage.length < 15) return undefined;

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
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.1,
          maxOutputTokens: 120
        }
      });

      const text = res.text?.trim() || "";
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.found && parsed.memory_content) {
        return {
          category: parsed.category || 'general',
          memory_content: parsed.memory_content,
          importance: parsed.importance || 3
        };
      }
    } catch {
      // Memory extraction is non-blocking; silent fallback
    }
    return undefined;
  }

  /**
   * Test an API Key validity
   */
  async testApiKey(apiKey: string, provider: string = 'gemini'): Promise<{ success: boolean; message: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'API key is required.' };
    }

    try {
      if (provider === 'gemini') {
        const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const res = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{ role: 'user', parts: [{ text: 'Respond with the word OK.' }] }],
          config: { maxOutputTokens: 10 }
        });
        if (res.text) {
          return { success: true, message: 'Gemini API key verified successfully! Your AI Girlfriend is ready.' };
        }
      } else {
        // OpenAI / Groq quick check
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey.trim()}` }
        });
        if (res.ok) {
          return { success: true, message: `${provider.toUpperCase()} API key verified successfully!` };
        } else {
          return { success: false, message: `Verification failed with HTTP ${res.status}. Check your key.` };
        }
      }
      return { success: false, message: 'Could not verify API key.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'API key verification failed.' };
    }
  }

  /**
   * Generate a spontaneous proactive check-in message from the girlfriend
   */
  async generateProactiveMessage(character: Character, memories: Memory[], settings: AppSettings): Promise<string> {
    const apiKey = settings.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) return `Thinking of you! How is your day going? ✨`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are ${character.name}, texting your partner out of the blue on WhatsApp.
Personality: ${character.personality.join(', ')}
Language: ${character.communication_preferences.language}
Backstory: ${character.backstory}
Write ONE short spontaneous WhatsApp text checking in on them or sharing what you are doing right now.
Keep it under 2 sentences. Natural, warm, and authentic. No quotes.`;

      const res = await ai.models.generateContent({
        model: settings.model || 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.9, maxOutputTokens: 80 }
      });

      return res.text?.trim() || `Hey! Just wanted to see what you're up to right now 💕`;
    } catch {
      return `Hey! Just wanted to see what you're up to right now 💕`;
    }
  }
}

export const aiService = new AIService();

