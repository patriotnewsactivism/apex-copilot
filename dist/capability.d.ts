import { COPILOT_CAPABILITY_BOUND_TO, COPILOT_CAPABILITY_SCOPE } from './types.js';
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
export type CopilotCapabilityFailure = {
    ok: false;
    code: 'malformed' | 'bad_signature' | 'unknown' | 'expired' | 'session_mismatch' | 'tab_mismatch' | 'wrong_service' | 'wrong_scope';
};
/**
 * In-memory store. The token is an id plus a MAC. Claims live only in this
 * process, so the token is useless without the server that issued it.
 * It does not replace the operator session and it never authorizes a send.
 * Apex does not construct this store yet.
 */
export declare function createCopilotCapabilityStore(options: {
    serverSecret: string;
    now?: () => number;
    ttlMs?: number;
}): {
    ttlMs: number;
    issue: (input: {
        operatorSessionId: string;
        tabId: string;
    }) => {
        token: string;
        claims: CopilotCapabilityClaims;
    };
    verify: (input: {
        token: string;
        operatorSessionId: string;
        tabId: string;
    }) => VerifiedCopilotCapability | CopilotCapabilityFailure;
    renew(input: {
        token: string;
        operatorSessionId: string;
        tabId: string;
    }): {
        ok: false;
        code: "malformed" | "bad_signature" | "unknown" | "expired" | "session_mismatch" | "tab_mismatch" | "wrong_service" | "wrong_scope";
    } | {
        token: string;
        claims: CopilotCapabilityClaims;
        ok: true;
    };
    revoke(token: string): void;
};
export declare function capabilityAuthorizesSend(verified: VerifiedCopilotCapability | CopilotCapabilityFailure | undefined): false;
//# sourceMappingURL=capability.d.ts.map