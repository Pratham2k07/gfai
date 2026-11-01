import { Character, Message, Memory, AppSettings } from '../types';

const API_BASE = '/api';

export async function fetchCharacters(): Promise<Character[]> {
  const res = await fetch(`${API_BASE}/characters`);
  if (!res.ok) throw new Error('Failed to load characters');
  return res.json();
}

export async function fetchCharacter(id: string): Promise<Character> {
  const res = await fetch(`${API_BASE}/characters/${id}`);
  if (!res.ok) throw new Error('Failed to load character');
  return res.json();
}

export async function createCharacter(character: Partial<Character>): Promise<Character> {
  const res = await fetch(`${API_BASE}/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(character),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create character');
  }
  return res.json();
}

export async function updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
  const res = await fetch(`${API_BASE}/characters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update character');
  return res.json();
}

export async function deleteCharacter(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/characters/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete character');
}

export async function fetchMessages(characterId: string): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/messages`);
  if (!res.ok) throw new Error('Failed to load messages');
  return res.json();
}

export async function sendMessage(
  characterId: string,
  payload: { message?: string; media_url?: string; media_type?: 'image' | 'audio' }
): Promise<{
  userMessage: Message;
  aiMessage: Message;
  newMemory?: Memory;
  relationshipUpdate?: { level: number; title: string; xp: number; leveledUp: boolean };
}> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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

export async function clearChatHistory(characterId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/messages`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear chat history');
}

export async function toggleMessageLike(characterId: string, messageId: string): Promise<Message> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/messages/${messageId}/like`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to toggle like');
  return res.json();
}

export async function fetchMemories(characterId: string): Promise<Memory[]> {
  const res = await fetch(`${API_BASE}/characters/${characterId}/memories`);
  if (!res.ok) throw new Error('Failed to load memories');
  return res.json();
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

