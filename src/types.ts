/** Safe dashboard pages. Copied from the shipped Apex registry. */
export const COPILOT_SAFE_PAGES = [
  'command',
  'chat',
  'mission',
  'agents',
  'tasks',
  'leads',
  'contacts',
  'territories',
  'webinars',
  'artifacts',
  'scheduled',
  'suggestions',
  'logs',
  'health',
  'learning',
  'multiapp',
  'verify-scale',
] as const;

export type CopilotSafePage = (typeof COPILOT_SAFE_PAGES)[number];

export type CopilotSearchPage = 'leads' | 'contacts';

export type CopilotAction =
  | { type: 'navigate'; page: CopilotSafePage }
  | { type: 'search'; page: CopilotSearchPage; query: string }
  | { type: 'setFilter'; page: CopilotSearchPage; field: string; value: string | boolean | null }
  | { type: 'openRecord'; recordType: 'contact'; id: string };

export type CopilotPanelAction = Extract<CopilotAction, { type: 'search' | 'setFilter' | 'openRecord' }>;

export const COPILOT_PANEL_EVENT = 'apex:copilot-panel-action';

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
export const COPILOT_EXCLUDED_PAGES = [
  'settings',
  'pending-sends',
  'approvals',
  'spend',
  'control',
  'pipeline',
  'sales-ops',
] as const;

export const COPILOT_CONTACT_FILTERS = [
  'q',
  'tag',
  'city',
  'state',
  'verifiedOnly',
  'ownerBot',
  'replied',
  'campaignId',
] as const;

export const COPILOT_LEAD_FILTERS = ['status', 'pipelineState', 'industry'] as const;

export const COPILOT_READ_ONLY_CHAT_TOOL_NAMES = [
  'get_pending_approvals',
  'get_recent_goals',
  'get_recent_activity',
  'get_goal_progress',
] as const;

export const COPILOT_CONTROL_TOOL_NAME = 'control_dashboard';

export const COPILOT_HARD_DENY_ACTIONS = [
  'send',
  'sendEmail',
  'sendSms',
  'sendInvite',
  'makeOutboundCall',
  'releaseSend',
  'confirm',
  'confirmApproval',
  'enterCode',
  'setKillSwitch',
  'setOutboundPolicy',
  'readSecret',
  'writeSecret',
  'changeBilling',
  'makePayment',
  'delete',
  'deleteRecord',
  'deploy',
  'rollback',
  'mergeContacts',
  'changeUser',
  'changePermission',
] as const;

/**
 * Compacted lowercase alphanumeric substrings. A candidate action type is
 * denied when its compacted name contains any of these tokens.
 */
export const COPILOT_DENY_TOKENS = [
  'send',
  'invite',
  'call',
  'release',
  'confirm',
  'approval',
  'code',
  'killswitch',
  'outboundpolicy',
  'secret',
  'apikey',
  'billing',
  'payment',
  'delete',
  'deploy',
  'rollback',
  'merge',
  'user',
  'permission',
] as const;

export const COPILOT_SERVER_FLAG = 'FEATURE_COPILOT';
export const COPILOT_CLIENT_FLAG = 'VITE_FEATURE_COPILOT';

/** Matches QuickChat.tsx: `10 * 60_000`. */
export const COPILOT_IDLE_TIMEOUT_MS = 10 * 60_000;

export const COPILOT_OPERATOR_SESSION_HEADER = 'x-apex-operator-session';

export const COPILOT_MAX_ACTIONS_PER_TOOL_CALL = 10;
export const COPILOT_MAX_ACTIONS_PER_MINUTE = 30;
export const COPILOT_MAX_ACTIONS_PER_SESSION = 200;

export const COPILOT_CAPABILITY_TTL_MS = 15 * 60_000;
export const COPILOT_CAPABILITY_BOUND_TO = 'apex-api';
export const COPILOT_CAPABILITY_SCOPE = 'dashboard-control';
