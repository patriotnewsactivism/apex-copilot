import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  COPILOT_CAPABILITY_BOUND_TO,
  COPILOT_CAPABILITY_SCOPE,
  COPILOT_CAPABILITY_TTL_MS,
} from './types.js';

export interface CopilotCapabilityClaims {
  id: string;
  operatorSessionId: string;
  tabId: string;
  boundTo: typeof COPILOT_CAPABILITY_BOUND_TO;
  scope: typeof COPILOT_CAPABILITY_SCOPE;
  issuedAt: number;
  expiresAt: number;
}

export interface VerifiedCopilotCapability {
  ok: true;
  claims: CopilotCapabilityClaims;
  operatorSessionStillRequired: true;
  authorizesSend: false;
}

export type CopilotCapabilityFailure =
  | { ok: false; code: 'malformed' | 'bad_signature' | 'unknown' | 'expired' | 'session_mismatch' | 'tab_mismatch' | 'wrong_service' | 'wrong_scope' };

/**
 * In-memory store. The token is an id plus a MAC. Claims live only in this
 * process, so the token is useless without the server that issued it.
 * It does not replace the operator session and it never authorizes a send.
 * Apex does not construct this store yet.
 */
export function createCopilotCapabilityStore(options: {
  serverSecret: string;
  now?: () => number;
  ttlMs?: number;
}) {
  if (options.serverSecret.length < 16) {
    throw new Error('Copilot capability secret must be at least 16 characters.');
  }
  const now = options.now ?? (() => Date.now());
  const ttlMs = options.ttlMs ?? COPILOT_CAPABILITY_TTL_MS;
  const records = new Map<string, CopilotCapabilityClaims>();

  function mac(id: string): Buffer {
    return createHmac('sha256', options.serverSecret).update(id).digest();
  }

  function pack(id: string): string {
    return `ac1.${id}.${mac(id).toString('base64url')}`;
  }

  function unpack(token: string): { id: string } | CopilotCapabilityFailure {
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

  function issue(input: { operatorSessionId: string; tabId: string }): { token: string; claims: CopilotCapabilityClaims } {
    if (!input.operatorSessionId.trim() || !input.tabId.trim()) {
      throw new Error('A capability token requires an operator session id and a tab id.');
    }
    const issuedAt = now();
    const claims: CopilotCapabilityClaims = {
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

  function verify(input: {
    token: string;
    operatorSessionId: string;
    tabId: string;
  }): VerifiedCopilotCapability | CopilotCapabilityFailure {
    const unpacked = unpack(input.token);
    if ('ok' in unpacked) return unpacked;
    const claims = records.get(unpacked.id);
    if (!claims) return { ok: false, code: 'unknown' };
    if (claims.boundTo !== COPILOT_CAPABILITY_BOUND_TO) return { ok: false, code: 'wrong_service' };
    if (claims.scope !== COPILOT_CAPABILITY_SCOPE) return { ok: false, code: 'wrong_scope' };
    if (now() >= claims.expiresAt) return { ok: false, code: 'expired' };
    if (claims.operatorSessionId !== input.operatorSessionId) return { ok: false, code: 'session_mismatch' };
    if (claims.tabId !== input.tabId) return { ok: false, code: 'tab_mismatch' };
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
    renew(input: { token: string; operatorSessionId: string; tabId: string }) {
      const verified = verify(input);
      if (!verified.ok) return verified;
      records.delete(verified.claims.id);
      return { ok: true as const, ...issue({ operatorSessionId: input.operatorSessionId, tabId: input.tabId }) };
    },
    revoke(token: string): void {
      const unpacked = unpack(token);
      if (!('ok' in unpacked)) records.delete(unpacked.id);
    },
  };
}

export function capabilityAuthorizesSend(
  verified: VerifiedCopilotCapability | CopilotCapabilityFailure | undefined,
): false {
  void verified;
  return false;
}
