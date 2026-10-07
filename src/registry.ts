import { z } from 'zod';
import {
  COPILOT_CONTACT_FILTERS,
  COPILOT_CONTROL_TOOL_NAME,
  COPILOT_DENY_TOKENS,
  COPILOT_HARD_DENY_ACTIONS,
  COPILOT_LEAD_FILTERS,
  COPILOT_MAX_ACTIONS_PER_TOOL_CALL,
  COPILOT_READ_ONLY_CHAT_TOOL_NAMES,
  COPILOT_SAFE_PAGES,
  type CopilotAction,
  type CopilotSafePage,
} from './types.js';

const copilotSafePageSchema = z.enum(
  COPILOT_SAFE_PAGES as unknown as [CopilotSafePage, ...CopilotSafePage[]],
);

const navigateActionSchema = z.object({
  type: z.literal('navigate'),
  page: copilotSafePageSchema,
}).strict();

const searchActionSchema = z.object({
  type: z.literal('search'),
  page: z.enum(['leads', 'contacts']),
  query: z.string().trim().min(1).max(200),
}).strict();

const setFilterActionSchema = z.object({
  type: z.literal('setFilter'),
  page: z.enum(['leads', 'contacts']),
  field: z.string().trim().min(1).max(64),
  value: z.union([z.string().max(200), z.boolean(), z.null()]),
}).strict();

const openRecordActionSchema = z.object({
  type: z.literal('openRecord'),
  recordType: z.literal('contact'),
  id: z.string().uuid(),
}).strict();

export const copilotActionSchema = z.discriminatedUnion('type', [
  navigateActionSchema,
  searchActionSchema,
  setFilterActionSchema,
  openRecordActionSchema,
]);

const CONTACT_FILTERS = new Set<string>(COPILOT_CONTACT_FILTERS);
const LEAD_FILTERS = new Set<string>(COPILOT_LEAD_FILTERS);

export function isCopilotChatToolAllowed(toolName: string): boolean {
  return toolName === COPILOT_CONTROL_TOOL_NAME
    || (COPILOT_READ_ONLY_CHAT_TOOL_NAMES as readonly string[]).includes(toolName);
}

export type CopilotActionValidation =
  | { ok: true; action: CopilotAction }
  | { ok: false; code: 'denied' | 'invalid' | 'not_allowed'; reason: string; actionType?: string };

function compactActionName(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

export function isHardDeniedCopilotAction(actionType: string): boolean {
  const compact = compactActionName(actionType);
  return COPILOT_DENY_TOKENS.some((token) => compact.includes(token));
}

export function validateCopilotAction(input: unknown): CopilotActionValidation {
  const actionType =
    typeof input === 'object' && input !== null && 'type' in input && typeof input.type === 'string'
      ? input.type
      : undefined;

  if (actionType && isHardDeniedCopilotAction(actionType)) {
    return {
      ok: false,
      code: 'denied',
      reason: `"${actionType}" is blocked by the Apex Copilot hard deny policy.`,
      actionType,
    };
  }

  const parsed = copilotActionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: actionType ? 'not_allowed' : 'invalid',
      reason: actionType
        ? `"${actionType}" is not in the Apex Copilot action registry.`
        : 'Apex Copilot actions require a valid action type and arguments.',
      ...(actionType ? { actionType } : {}),
    };
  }

  if (parsed.data.type === 'setFilter') {
    const allowed = parsed.data.page === 'contacts'
      ? CONTACT_FILTERS.has(parsed.data.field)
      : LEAD_FILTERS.has(parsed.data.field);
    if (!allowed) {
      return {
        ok: false,
        code: 'not_allowed',
        reason: `Filter "${parsed.data.field}" is not allowed on ${parsed.data.page}.`,
        actionType: parsed.data.type,
      };
    }
  }

  return { ok: true, action: parsed.data };
}

export function validateCopilotActions(input: unknown): {
  actions: CopilotAction[];
  rejected: Array<Exclude<CopilotActionValidation, { ok: true }>>;
} {
  if (!Array.isArray(input)) {
    return {
      actions: [],
      rejected: [{ ok: false, code: 'invalid', reason: 'Apex Copilot requires an actions array.' }],
    };
  }

  const actions: CopilotAction[] = [];
  const rejected: Array<Exclude<CopilotActionValidation, { ok: true }>> = [];
  for (const candidate of input.slice(0, COPILOT_MAX_ACTIONS_PER_TOOL_CALL)) {
    const result = validateCopilotAction(candidate);
    if (result.ok) actions.push(result.action);
    else rejected.push(result);
  }
  return { actions, rejected };
}

export { COPILOT_HARD_DENY_ACTIONS };
