import { COPILOT_MAX_ACTIONS_PER_MINUTE, COPILOT_MAX_ACTIONS_PER_SESSION } from './types.js';
const WINDOW_MS = 60_000;
/**
 * 30 actions in a rolling minute and 200 per session.
 * A rejected consume does not count. Apex does not call this yet.
 */
export function createCopilotRateLimiter(now = () => Date.now()) {
    const timestamps = new Map();
    const sessionCounts = new Map();
    function snapshot(sessionId, at) {
        const recent = (timestamps.get(sessionId) ?? []).filter((stamp) => stamp > at - WINDOW_MS);
        return { recent, sessionCount: sessionCounts.get(sessionId) ?? 0 };
    }
    return {
        perMinute: COPILOT_MAX_ACTIONS_PER_MINUTE,
        perSession: COPILOT_MAX_ACTIONS_PER_SESSION,
        consume(sessionId, count = 1) {
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
//# sourceMappingURL=rate-limit.js.map