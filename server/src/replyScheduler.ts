import { DelayBucket, PendingReplyInfo } from './types.js';

export interface PendingReply {
  characterId: string;
  userMessageId?: string;
  scheduledAt: number; // Unix timestamp in ms
  delayMs: number;
  seenTypingSeconds: number; // Final typing duration (within 10s based on word count)
  bucket: DelayBucket;
  isNight: boolean;
  timer: NodeJS.Timeout;
  onExecute: () => Promise<any>;
}

export function calculateReplyDelay(options?: {
  clientHour?: number;
  realisticDelaysEnabled?: boolean;
  wordCount?: number;
}): { delayMs: number; seenTypingSeconds: number; bucket: DelayBucket; isNight: boolean; description: string } {
  // Typing duration based on word count:
  // "no instant reply like it should take typind time depending on the amount of words"
  // "if seen then within 10 seconds we need reply"
  const count = typeof options?.wordCount === 'number' && options.wordCount > 0 ? options.wordCount : 18;
  // Realistic mobile typing speed ~0.25s per word, bounded between 4s minimum and 10s maximum!
  const seenTypingSeconds = Math.min(10, Math.max(4, Math.round(count * 0.25)));
  const seenTypingMs = seenTypingSeconds * 1000;

  if (options?.realisticDelaysEnabled === false) {
    return {
      delayMs: seenTypingMs,
      seenTypingSeconds,
      bucket: 'instant',
      isNight: false,
      description: `Realistic typing (${seenTypingSeconds}s)`
    };
  }

  // Determine current hour: use client hour if valid (0-23), else server local hour
  const hour = (typeof options?.clientHour === 'number' && options.clientHour >= 0 && options.clientHour <= 23)
    ? options.clientHour
    : new Date().getHours();

  // Night hours: 10:00 PM (22:00) to 6:00 AM (06:00)
  const isNight = hour >= 22 || hour < 6;

  if (isNight) {
    // Night requirement: "instant to 15-20 seconds reply in night"
    // Delivered for ~7-12s, then Seen + Typing for final 4-8s (within 10s max!)
    const totalNightSec = Math.floor(Math.random() * (20 - 15 + 1)) + 15;
    const delayMs = Math.max(seenTypingMs + 3000, totalNightSec * 1000);
    return {
      delayMs,
      seenTypingSeconds,
      bucket: 'night',
      isNight: true,
      description: `Night active chat (~${Math.round(delayMs / 1000)}s total, typing final ${seenTypingSeconds}s)`
    };
  }

  // Daytime requirement: "and other and reverse in day just like a normal person"
  // Day hours are slower because normal people are busy, capped at 2 minutes maximum
  const roll = Math.random();
  let totalDaySec: number;
  let bucket: DelayBucket;

  if (roll < 0.25) {
    // 25% chance: Quick reply (happened to check phone) -> 25 to 40 seconds
    totalDaySec = Math.floor(Math.random() * (40 - 25 + 1)) + 25;
    bucket = 'instant';
  } else if (roll < 0.70) {
    // 45% chance: Standard daytime gap -> 45 to 75 seconds (~1 min)
    totalDaySec = Math.floor(Math.random() * (75 - 45 + 1)) + 45;
    bucket = 'medium';
  } else {
    // 30% chance: Busy daytime gap -> 80 to 120 seconds (capped at 2 min max!)
    totalDaySec = Math.floor(Math.random() * (120 - 80 + 1)) + 80;
    bucket = 'long';
  }

  const delayMs = Math.max(seenTypingMs + 5000, totalDaySec * 1000);
  return {
    delayMs,
    seenTypingSeconds,
    bucket,
    isNight: false,
    description: `Daytime reply (~${Math.round(delayMs / 1000)}s total, typing final ${seenTypingSeconds}s)`
  };
}

class ReplyScheduler {
  private pendingMap = new Map<string, PendingReply>();

  /**
   * Schedule a companion reply for a character.
   * If a reply is already pending, keep the existing countdown.
   */
  scheduleReply(
    characterId: string,
    delayMs: number,
    seenTypingSeconds: number,
    bucket: DelayBucket,
    isNight: boolean,
    onExecute: () => Promise<any>
  ): PendingReplyInfo {
    const existing = this.pendingMap.get(characterId);
    if (existing) {
      const now = Date.now();
      const remainingMs = existing.scheduledAt - now;

      if (remainingMs > 0) {
        existing.onExecute = onExecute;
        return this.getInfo(characterId)!;
      }

      clearTimeout(existing.timer);
    }

    const scheduledAt = Date.now() + delayMs;

    const timer = setTimeout(async () => {
      try {
        const item = this.pendingMap.get(characterId);
        if (item) {
          await item.onExecute();
        }
      } catch (err) {
        console.error(`[ReplyScheduler] Failed to generate scheduled reply for ${characterId}:`, err);
      } finally {
        this.pendingMap.delete(characterId);
      }
    }, delayMs);

    const pending: PendingReply = {
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

    return this.getInfo(characterId)!;
  }

  getPending(characterId: string): PendingReply | undefined {
    return this.pendingMap.get(characterId);
  }

  getInfo(characterId: string): PendingReplyInfo | null {
    const pending = this.pendingMap.get(characterId);
    if (!pending) return null;

    const now = Date.now();
    const remainingMs = Math.max(0, pending.scheduledAt - now);
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    // Seen and typing only in the final seenTypingSeconds (strictly within 10s!)
    const typingWindow = pending.seenTypingSeconds || 6;
    const isSeen = remainingSeconds <= typingWindow && remainingSeconds > 0;
    const isTyping = isSeen;

    return {
      characterId,
      scheduledAt: pending.scheduledAt,
      delaySeconds: Math.round(pending.delayMs / 1000),
      remainingSeconds,
      seenTypingSeconds: typingWindow,
      bucket: pending.bucket,
      isNight: pending.isNight,
      isTyping,
      isSeen
    };
  }

  getAllPending(): Record<string, PendingReplyInfo> {
    const result: Record<string, PendingReplyInfo> = {};
    for (const id of this.pendingMap.keys()) {
      const info = this.getInfo(id);
      if (info) result[id] = info;
    }
    return result;
  }

  async triggerImmediately(characterId: string, fallbackExecute?: () => Promise<any>): Promise<any> {
    const pending = this.pendingMap.get(characterId);
    let executeFn = fallbackExecute;
    if (pending) {
      clearTimeout(pending.timer);
      executeFn = pending.onExecute;
      this.pendingMap.delete(characterId);
    }
    // Realistic short typing delay (3.5s) so instant/skip is never a robot
    await new Promise(resolve => setTimeout(resolve, 3500));
    if (executeFn) {
      return executeFn();
    }
    return null;
  }

  cancel(characterId: string): void {
    const pending = this.pendingMap.get(characterId);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingMap.delete(characterId);
    }
  }
}

export const replyScheduler = new ReplyScheduler();
