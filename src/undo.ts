import { validateCopilotAction } from './registry.js';
import type { CopilotAction, CopilotSafePage } from './types.js';

export type CopilotUndo =
  | { reversible: true; inverse: CopilotAction }
  | { reversible: false; reason: string };

export interface CopilotUndoPrior {
  page?: CopilotSafePage;
  query?: string;
  value?: string | boolean | null;
  valueKnown?: boolean;
}

/**
 * Undo descriptors only. Nothing is applied.
 * openRecord has no inverse. Search can be restored only to a non-empty query.
 * setFilter and navigate are reversible only when the prior value itself validates.
 */
export function undoForCopilotAction(action: CopilotAction, prior: CopilotUndoPrior = {}): CopilotUndo {
  if (action.type === 'openRecord') {
    return { reversible: false, reason: 'Opening a contact has no inverse in the action registry.' };
  }

  if (action.type === 'navigate') {
    if (!prior.page) {
      return { reversible: false, reason: 'Navigation is reversible only when the previous safe page is known.' };
    }
    const validated = validateCopilotAction({ type: 'navigate', page: prior.page });
    if (!validated.ok) {
      return { reversible: false, reason: 'The previous page is not a safe Copilot page.' };
    }
    return { reversible: true, inverse: validated.action };
  }

  if (action.type === 'search') {
    if (typeof prior.query !== 'string' || prior.query.trim().length === 0) {
      return {
        reversible: false,
        reason: 'Clearing a search is not an allow-listed action, so an empty prior query cannot be restored.',
      };
    }
    const validated = validateCopilotAction({ type: 'search', page: action.page, query: prior.query });
    if (!validated.ok) return { reversible: false, reason: validated.reason };
    return { reversible: true, inverse: validated.action };
  }

  if (prior.valueKnown !== true) {
    return { reversible: false, reason: 'A filter is reversible only when the previous value is known.' };
  }
  const validated = validateCopilotAction({
    type: 'setFilter',
    page: action.page,
    field: action.field,
    value: prior.value ?? null,
  });
  if (!validated.ok) return { reversible: false, reason: validated.reason };
  return { reversible: true, inverse: validated.action };
}
