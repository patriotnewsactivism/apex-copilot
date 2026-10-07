import { COPILOT_MAX_ACTIONS_PER_MINUTE, COPILOT_MAX_ACTIONS_PER_SESSION } from './types.js';

export interface CopilotRateLimitDecision {
  ok: boolean;
  code?: 'rate_limited_minute' | 'rate_limited_session' | 'invalid_count';
  reason?: string;
  minuteCount: number;
  sessionCount: number;
}

const WINDOW_MS = 60_000;

/**
 * 30 actions in a rolling minute and 200 per session.
 * A rejected consume does not count. Apex does not call this yet.
 */
export function createCopilotRateLimiter(now: () => number = () => Date.now()) {
  const timestamps = new Map<string, number[]>();
  const sessionCounts = new Map<string, number>();

  function snapshot(sessionId: string, at: number): { recent: number[]; sessionCount: number } {
    const recent = (timestamps.get(sessionId) ?? []).filter((stamp) => stamp > at - WINDOW_MS);
    return { recent, sessionCount: sessionCounts.get(sessionId) ?? 0 };
  }

  return {
    perMinute: COPILOT_MAX_ACTIONS_PER_MINUTE,
    perSession: COPILOT_MAX_ACTIONS_PER_SESSION,
    consume(sessionId: string, count = 1): CopilotRateLimitDecision {
      const at = now();
      const current = snapshot(sessionId, at);
      if (!Number.isInteger(count) || count < 1) {
        return {
          ok: false,
          code: 'invalid_count',
          reason: 'Copilot rate limits count whole actions.',
          minuteCount: current.recent.length,
          sessionCount: current.sessionCount,
        };
      }
      if (current.recent.length + count > COPILOT_MAX_ACTIONS_PER_MINUTE) {
        return {
          ok: false,
          code: 'rate_limited_minute',
          reason: `Apex Copilot allows ${COPILOT_MAX_ACTIONS_PER_MINUTE} actions per minute.`,
          minuteCount: current.recent.length,
          sessionCount: current.sessionCount,
        };
      }
      if (current.sessionCount + count > COPILOT_MAX_ACTIONS_PER_SESSION) {
        return {
          ok: false,
          code: 'rate_limited_session',
          reason: `Apex Copilot allows ${COPILOT_MAX_ACTIONS_PER_SESSION} actions per session.`,
          minuteCount: current.recent.length,
          sessionCount: current.sessionCount,
        };
      }
      const next = current.recent.concat(Array.from({ length: count }, () => at));
      timestamps.set(sessionId, next);
      const sessionCount = current.sessionCount + count;
      sessionCounts.set(sessionId, sessionCount);
      return { ok: true, minuteCount: next.length, sessionCount };
    },
  };
}
