/** Safe dashboard pages. Copied from the shipped Apex registry. */
export declare const COPILOT_SAFE_PAGES: readonly ["command", "chat", "mission", "agents", "tasks", "leads", "contacts", "territories", "webinars", "artifacts", "scheduled", "suggestions", "logs", "health", "learning", "multiapp", "verify-scale"];
export type CopilotSafePage = (typeof COPILOT_SAFE_PAGES)[number];
export type CopilotSearchPage = 'leads' | 'contacts';
export type CopilotAction = {
    type: 'navigate';
    page: CopilotSafePage;
} | {
    type: 'search';
    page: CopilotSearchPage;
    query: string;
} | {
    type: 'setFilter';
    page: CopilotSearchPage;
    field: string;
    value: string | boolean | null;
} | {
    type: 'openRecord';
    recordType: 'contact';
    id: string;
};
export type CopilotPanelAction = Extract<CopilotAction, {
    type: 'search' | 'setFilter' | 'openRecord';
}>;
export declare const COPILOT_PANEL_EVENT = "apex:copilot-panel-action";
export interface CopilotPanelActionResult {
    ok: boolean;
    reason?: string;
}
export interface CopilotPanelEventDetail {
    action: CopilotPanelAction;
    acknowledge: (result: CopilotPanelActionResult) => void;
}
export interface CopilotUiController {
    available: boolean;
    active: boolean;
    busy: boolean;
    sessionId: string;
    start: () => void;
    stop: (reason?: string) => void;
    execute: (actions: CopilotAction[], narrate: (message: string) => void) => Promise<void>;
}
/** Pages the shipped registry refuses because they are absent from the safe list. */
export declare const COPILOT_EXCLUDED_PAGES: readonly ["settings", "pending-sends", "approvals", "spend", "control", "pipeline", "sales-ops"];
export declare const COPILOT_CONTACT_FILTERS: readonly ["q", "tag", "city", "state", "verifiedOnly", "ownerBot", "replied", "campaignId"];
export declare const COPILOT_LEAD_FILTERS: readonly ["status", "pipelineState", "industry"];
export declare const COPILOT_READ_ONLY_CHAT_TOOL_NAMES: readonly ["get_pending_approvals", "get_recent_goals", "get_recent_activity", "get_goal_progress"];
export declare const COPILOT_CONTROL_TOOL_NAME = "control_dashboard";
export declare const COPILOT_HARD_DENY_ACTIONS: readonly ["send", "sendEmail", "sendSms", "sendInvite", "makeOutboundCall", "releaseSend", "confirm", "confirmApproval", "enterCode", "setKillSwitch", "setOutboundPolicy", "readSecret", "writeSecret", "changeBilling", "makePayment", "delete", "deleteRecord", "deploy", "rollback", "mergeContacts", "changeUser", "changePermission"];
/**
 * Compacted lowercase alphanumeric substrings. A candidate action type is
 * denied when its compacted name contains any of these tokens.
 */
export declare const COPILOT_DENY_TOKENS: readonly ["send", "invite", "call", "release", "confirm", "approval", "code", "killswitch", "outboundpolicy", "secret", "apikey", "billing", "payment", "delete", "deploy", "rollback", "merge", "user", "permission"];
export declare const COPILOT_SERVER_FLAG = "FEATURE_COPILOT";
export declare const COPILOT_CLIENT_FLAG = "VITE_FEATURE_COPILOT";
/** Matches QuickChat.tsx: `10 * 60_000`. */
export declare const COPILOT_IDLE_TIMEOUT_MS: number;
export declare const COPILOT_OPERATOR_SESSION_HEADER = "x-apex-operator-session";
export declare const COPILOT_MAX_ACTIONS_PER_TOOL_CALL = 10;
export declare const COPILOT_MAX_ACTIONS_PER_MINUTE = 30;
export declare const COPILOT_MAX_ACTIONS_PER_SESSION = 200;
export declare const COPILOT_CAPABILITY_TTL_MS: number;
export declare const COPILOT_CAPABILITY_BOUND_TO = "apex-api";
export declare const COPILOT_CAPABILITY_SCOPE = "dashboard-control";
//# sourceMappingURL=types.d.ts.map