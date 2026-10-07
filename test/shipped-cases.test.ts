import { describe, expect, it } from 'vitest';
import {
  COPILOT_HARD_DENY_ACTIONS,
  isCopilotChatToolAllowed,
  isCopilotClientFeatureEnabled,
  isCopilotFeatureEnabled,
  validateCopilotAction,
} from '../src/index.js';

describe('Apex Copilot feature flag', () => {
  it('is off by default and accepts only an explicit true value', () => {
    expect(isCopilotFeatureEnabled({})).toBe(false);
    expect(isCopilotFeatureEnabled({ FEATURE_COPILOT: 'false' })).toBe(false);
    expect(isCopilotFeatureEnabled({ FEATURE_COPILOT: '1' })).toBe(false);
    expect(isCopilotFeatureEnabled({ FEATURE_COPILOT: 'true' })).toBe(true);
    expect(isCopilotFeatureEnabled({ FEATURE_COPILOT: ' TRUE ' })).toBe(true);
    const env = { ...process.env };
    delete env.FEATURE_COPILOT;
    delete env.VITE_FEATURE_COPILOT;
    expect(isCopilotFeatureEnabled(env)).toBe(false);
  });

  it('keeps the dashboard toggle hidden unless the Vite flag is explicitly true', () => {
    expect(isCopilotClientFeatureEnabled(undefined)).toBe(false);
    expect(isCopilotClientFeatureEnabled('false')).toBe(false);
    expect(isCopilotClientFeatureEnabled('1')).toBe(false);
    expect(isCopilotClientFeatureEnabled('true')).toBe(true);
    expect(isCopilotClientFeatureEnabled(' TRUE ')).toBe(true);
  });
});

describe('Apex Copilot action registry', () => {
  it('accepts only the scoped dashboard actions', () => {
    expect(validateCopilotAction({ type: 'navigate', page: 'contacts' })).toEqual({
      ok: true,
      action: { type: 'navigate', page: 'contacts' },
    });
    expect(validateCopilotAction({
      type: 'setFilter', page: 'leads', field: 'status', value: 'qualified',
    }).ok).toBe(true);
    expect(validateCopilotAction({
      type: 'setFilter', page: 'contacts', field: 'doNotContact', value: true,
    }).ok).toBe(false);
  });

  it.each(COPILOT_HARD_DENY_ACTIONS)('hard-denies %s', (type) => {
    const result = validateCopilotAction({ type });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('denied');
  });

  it('rejects unknown and sensitive destinations', () => {
    const click = validateCopilotAction({ type: 'click', selector: '#anything' });
    const settings = validateCopilotAction({ type: 'navigate', page: 'settings' });
    const pending = validateCopilotAction({ type: 'navigate', page: 'pending-sends' });
    expect(click.ok).toBe(false);
    expect(settings.ok).toBe(false);
    expect(pending.ok).toBe(false);
    if (!click.ok) expect(click.code).toBe('not_allowed');
    if (!settings.ok) expect(settings.code).toBe('not_allowed');
  });

  it('rejects malformed actions as invalid', () => {
    for (const input of [null, undefined, {}, { type: 1 }, 'navigate']) {
      const result = validateCopilotAction(input);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('invalid');
    }
  });

  it('does not execute hidden mutating chat tools while Copilot is active', () => {
    expect(isCopilotChatToolAllowed('control_dashboard')).toBe(true);
    expect(isCopilotChatToolAllowed('get_recent_goals')).toBe(true);
    expect(isCopilotChatToolAllowed('create_goal')).toBe(false);
    expect(isCopilotChatToolAllowed('approve_pending_approval')).toBe(false);
    expect(isCopilotChatToolAllowed('cancel_goal')).toBe(false);
  });
});
