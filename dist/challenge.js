import { randomBytes, timingSafeEqual } from 'node:crypto';
import { isHardDeniedCopilotAction } from './registry.js';
export const COPILOT_DO_IT_TTL_MS = 2 * 60_000;
export const COPILOT_DO_IT_PROMPT = 'Do it?';
export const COPILOT_MEDIUM_RISK_ACTIONS = [
    { type: 'editCampaign', label: 'campaign edit' },
    { type: 'bulkEdit', label: 'bulk edit' },
    { type: 'mergeContacts', label: 'merge' },
];
const MODEL_ACTORS = new Set(['model', 'agent', 'copilot']);
export function createDoItChallenge(actionType, now = Date.now()) {
    return {
        publicChallenge: {
            id: randomBytes(16).toString('base64url'),
            prompt: COPILOT_DO_IT_PROMPT,
            actionType,
            expiresAt: now + COPILOT_DO_IT_TTL_MS,
        },
        proof: randomBytes(24).toString('base64url'),
    };
}
export function satisfyDoItChallenge(record, input) {
    if (MODEL_ACTORS.has(input.actor) || input.actor !== 'human') {
        return { ok: false, code: 'model_cannot_satisfy' };
    }
    const now = input.now ?? Date.now();
    if (now >= record.publicChallenge.expiresAt)
        return { ok: false, code: 'expired' };
    const expected = Buffer.from(record.proof);
    const got = Buffer.from(input.proof);
    if (got.length !== expected.length || !timingSafeEqual(got, expected)) {
        return { ok: false, code: 'bad_proof' };
    }
    return { ok: true, challengeId: record.publicChallenge.id };
}
/**
 * A satisfied human challenge still does not make the action available.
 * Apex has not wired the challenge into a dashboard control.
 * Names that hit the shipped deny list stay hard-denied.
 */
export function mediumRiskActionAvailability(actionType, satisfaction) {
    void satisfaction;
    if (isHardDeniedCopilotAction(actionType)) {
        return {
            available: false,
            code: 'hard_denied',
            reason: `"${actionType}" stays on the shipped hard deny list. A Do it? challenge cannot override it.`,
        };
    }
    return {
        available: false,
        code: 'not_wired',
        reason: `"${actionType}" stays unavailable until Apex wires a human Do it? control. The model cannot satisfy that control.`,
    };
}
//# sourceMappingURL=challenge.js.map