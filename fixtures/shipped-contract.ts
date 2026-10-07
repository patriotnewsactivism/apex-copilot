/**
 * Frozen copy of the pure lists in Apex
 * packages/api-server/src/copilot-actions.ts at main
 * 2a83f6adc82e13ffb833b325073b0e26b5d62b4b, which contains merge
 * bc9d8422970c4308847fa46ea0129733526eded4 (PR 300, head 44fb82f).
 *
 * The package must not import this module. Conformance tests fail when the
 * package lists drift from this copy.
 */

export const SHIPPED_APEX_COMMIT = '2a83f6adc82e13ffb833b325073b0e26b5d62b4b';
export const SHIPPED_MERGE_COMMIT = 'bc9d8422970c4308847fa46ea0129733526eded4';

export const SHIPPED_SAFE_PAGES = [
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

export const SHIPPED_DENY_TOKENS = [
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

export const SHIPPED_READ_ONLY_TOOLS = [
  'get_pending_approvals',
  'get_recent_goals',
  'get_recent_activity',
  'get_goal_progress',
] as const;

export const SHIPPED_CONTROL_TOOL = 'control_dashboard';

export const SHIPPED_HARD_DENY_ACTIONS = [
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

export const SHIPPED_CONTACT_FILTERS = [
  'q',
  'tag',
  'city',
  'state',
  'verifiedOnly',
  'ownerBot',
  'replied',
  'campaignId',
] as const;

export const SHIPPED_LEAD_FILTERS = ['status', 'pipelineState', 'industry'] as const;

export const SHIPPED_EXCLUDED_PAGES = [
  'settings',
  'pending-sends',
  'approvals',
  'spend',
  'control',
  'pipeline',
  'sales-ops',
] as const;
