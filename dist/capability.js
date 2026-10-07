import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { COPILOT_CAPABILITY_BOUND_TO, COPILOT_CAPABILITY_SCOPE, COPILOT_CAPABILITY_TTL_MS, } from './types.js';
/**
 * In-memory store. The token is an id plus a MAC. Claims live only in this
 * process, so the token is useless without the server that issued it.
 * It does not replace the operator session and it never authorizes a send.
 * Apex does not construct this store yet.
 */
export function createCopilotCapabilityStore(options) {
    if (options.serverSecret.length < 16) {
        throw new Error('Copilot capability secret must be at least 16 characters.');
    }
    const now = options.now ?? (() => Date.now());
    const ttlMs = options.ttlMs ?? COPILOT_CAPABILITY_TTL_MS;
    const records = new Map();
    function mac(id) {
        return createHmac('sha256', options.serverSecret).update(id).digest();
    }
    function pack(id) {
        return `ac1.${id}.${mac(id).toString('base64url')}`;
    }
    function unpack(token) {
        const parts = token.split('.');
        if (parts.length !== 3 || parts[0] !== 'ac1' || !parts[1] || !parts[2]) {
            return { ok: false, code: 'malformed' };
        }
        const expected = mac(parts[1]);
        const got = Buffer.from(parts[2], 'base64url');
        if (got.length !== expected.length || !timingSafeEqual(got, expected)) {
            return { ok: false, code: 'bad_signature' };
        }
        return { id: parts[1] };
    }
    function issue(input) {
        if (!input.operatorSessionId.trim() || !input.tabId.trim()) {
            throw new Error('A capability token requires an operator session id and a tab id.');
        }
        const issuedAt = now();
        const claims = {
            id: randomBytes(16).toString('base64url'),
            operatorSessionId: input.operatorSessionId,
            tabId: input.tabId,
            boundTo: COPILOT_CAPABILITY_BOUND_TO,
            scope: COPILOT_CAPABILITY_SCOPE,
            issuedAt,
            expiresAt: issuedAt + ttlMs,
        };
        records.set(claims.id, claims);
        return { token: pack(claims.id), claims };
    }
    function verify(input) {
        const unpacked = unpack(input.token);
        if ('ok' in unpacked)
            return unpacked;
        const claims = records.get(unpacked.id);
        if (!claims)
            return { ok: false, code: 'unknown' };
        if (claims.boundTo !== COPILOT_CAPABILITY_BOUND_TO)
            return { ok: false, code: 'wrong_service' };
        if (claims.scope !== COPILOT_CAPABILITY_SCOPE)
            return { ok: false, code: 'wrong_scope' };
        if (now() >= claims.expiresAt)
            return { ok: false, code: 'expired' };
        if (claims.operatorSessionId !== input.operatorSessionId)
            return { ok: false, code: 'session_mismatch' };
        if (claims.tabId !== input.tabId)
            return { ok: false, code: 'tab_mismatch' };
        return {
            ok: true,
            claims,
            operatorSessionStillRequired: true,
            authorizesSend: false,
        };
    }
    return {
        ttlMs,
        issue,
        verify,
        renew(input) {
            const verified = verify(input);
            if (!verified.ok)
                return verified;
            records.delete(verified.claims.id);
            return { ok: true, ...issue({ operatorSessionId: input.operatorSessionId, tabId: input.tabId }) };
        },
        revoke(token) {
            const unpacked = unpack(token);
            if (!('ok' in unpacked))
                records.delete(unpacked.id);
        },
    };
}
export function capabilityAuthorizesSend(verified) {
    void verified;
    return false;
}
//# sourceMappingURL=capability.js.map