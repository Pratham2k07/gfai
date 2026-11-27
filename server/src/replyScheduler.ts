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
  const count = typeof options?.wordCount === 'number' && options.wordCount > 0 ? options.wordCount : 12;
  // Snappy mobile typing speed ~0.15s per word, bounded between 2s minimum and 5s maximum
  const seenTypingSeconds = Math.min(5, Math.max(2, Math.round(count * 0.15)));
  const seenTypingMs = seenTypingSeconds * 1000;

  if (options?.realisticDelaysEnabled === false) {
    return {
      delayMs: 0,
      seenTypingSeconds: 0,
      bucket: 'instant',
      isNight: false,
      description: `Instant reply`
    };
  }

  // Determine current hour: use client hour if valid (0-23), else server local hour
  const hour = (typeof options?.clientHour === 'number' && options.clientHour >= 0 && options.clientHour <= 23)
    ? options.clientHour
    : new Date().getHours();

  // Night hours: 10:00 PM (22:00) to 6:00 AM (06:00)
  const isNight = hour >= 22 || hour < 6;

  if (isNight) {
    // Night active chat: 4-7s total, typing in final 2-5s
    const totalNightSec = Math.floor(Math.random() * (7 - 4 + 1)) + 4;
    const delayMs = Math.max(seenTypingMs + 1000, totalNightSec * 1000);
    return {
      delayMs,
      seenTypingSeconds,
      bucket: 'night',
      isNight: true,
      description: `Night active chat (~${Math.round(delayMs / 1000)}s total, typing final ${seenTypingSeconds}s)`
    };
  }

  // Daytime realistic pacing: brisk 4-12s total
  const roll = Math.random();
  let totalDaySec: number;
  let bucket: DelayBucket;

  if (roll < 0.35) {
    // 35% chance: Quick reply -> 4 to 6 seconds
    totalDaySec = Math.floor(Math.random() * (6 - 4 + 1)) + 4;
    bucket = 'instant';
  } else if (roll < 0.80) {
    // 45% chance: Standard daytime gap -> 6 to 9 seconds
    totalDaySec = Math.floor(Math.random() * (9 - 6 + 1)) + 6;
    bucket = 'medium';
  } else {
    // 20% chance: Slightly busy -> 9 to 12 seconds
    totalDaySec = Math.floor(Math.random() * (12 - 9 + 1)) + 9;
    bucket = 'long';
  }

  const delayMs = Math.max(seenTypingMs + 1500, totalDaySec * 1000);
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
  private activeExecutions = new Map<string, Promise<any>>();

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
      const item = this.pendingMap.get(characterId);
      if (item) {
        this.pendingMap.delete(characterId);
        // Avoid double running if already in flight
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

  async checkAndExecutePending(characterId: string): Promise<boolean> {
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
    // If an execution is already in flight for this character, wait and return its result
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

  cancel(characterId: string): void {
    const pending = this.pendingMap.get(characterId);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingMap.delete(characterId);
    }
  }
}

export const replyScheduler = new ReplyScheduler();
