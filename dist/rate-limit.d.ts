export interface CopilotRateLimitDecision {
    ok: boolean;
    code?: 'rate_limited_minute' | 'rate_limited_session' | 'invalid_count';
    reason?: string;
    minuteCount: number;
    sessionCount: number;
}
/**
 * 30 actions in a rolling minute and 200 per session.
 * A rejected consume does not count. Apex does not call this yet.
 */
export declare function createCopilotRateLimiter(now?: () => number): {
    perMinute: number;
    perSession: number;
    consume(sessionId: string, count?: number): CopilotRateLimitDecision;
};
//# sourceMappingURL=rate-limit.d.ts.map