import { describe, expect, it } from 'vitest';
import {
  LEAD_OPEN_RECORD,
  adminBearerActivatesCopilot,
  buildCopilotSessionAuditEvent,
  buildCopilotUiAuditEvent,
  copilotActionTarget,
  copilotModeAllowed,
  describeCopilotAction,
  isCopilotPanelAction,
  queuedAuditResult,
  unsupportedControl,
  validateCopilotAction,
  validateCopilotActions,
} from '../src/index.js';

const CONTACT_ID = '11111111-1111-4111-8111-111111111111';

describe('registry details that match the shipped schema', () => {
  it('opens a contact uuid and refuses a lead', () => {
    expect(validateCopilotAction({ type: 'openRecord', recordType: 'contact', id: CONTACT_ID }).ok).toBe(true);
    const lead = validateCopilotAction({ type: 'openRecord', recordType: 'lead', id: CONTACT_ID });
    expect(lead.ok).toBe(false);
    if (!lead.ok) expect(lead.code).toBe('not_allowed');
    const badId = validateCopilotAction({ type: 'openRecord', recordType: 'contact', id: 'not-a-uuid' });
    expect(badId.ok).toBe(false);
    if (!badId.ok) expect(badId.code).toBe('not_allowed');
    expect(LEAD_OPEN_RECORD.supported).toBe(false);
    expect(LEAD_OPEN_RECORD.responseFields).toEqual(['success', 'id', 'status', 'pipelineState']);
  });

  it('allows the contact filters that shipped and still blocks doNotContact', () => {
    expect(validateCopilotAction({
      type: 'setFilter', page: 'contacts', field: 'verifiedOnly', value: true,
    }).ok).toBe(true);
    expect(validateCopilotAction({
      type: 'setFilter', page: 'contacts', field: 'q', value: null,
    }).ok).toBe(true);
    expect(validateCopilotAction({
      type: 'setFilter', page: 'leads', field: 'doNotContact', value: true,
    }).ok).toBe(false);
  });

  it('drops actions past the shipped batch of 10 and rejects a non-array', () => {
    const batch = Array.from({ length: 12 }, () => ({ type: 'navigate', page: 'contacts' }));
    const result = validateCopilotActions(batch);
    expect(result.actions).toHaveLength(10);
    expect(result.rejected).toHaveLength(0);
    expect(validateCopilotActions({ type: 'navigate' }).rejected[0]?.code).toBe('invalid');
  });

  it('rejects extra keys because the shipped schemas are strict', () => {
    const result = validateCopilotAction({ type: 'navigate', page: 'contacts', selector: '#x' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('not_allowed');
  });

  it('keeps form and layout names unsupported', () => {
    for (const type of ['fillField', 'setLayout'] as const) {
      const result = validateCopilotAction({ type });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('not_allowed');
      expect(unsupportedControl(type)?.status).toBe('unsupported');
    }
  });

  it('narrates and targets the way the dashboard helpers do', () => {
    const action = { type: 'search' as const, page: 'contacts' as const, query: 'Houston' };
    expect(describeCopilotAction(action)).toBe('Searching contacts for “Houston”');
    expect(copilotActionTarget(action)).toBe('[data-copilot-target="contacts-search"]');
    expect(copilotActionTarget({ type: 'navigate', page: 'verify-scale' })).toBe('#nav-verify-scale');
    expect(copilotActionTarget({ type: 'openRecord', recordType: 'contact', id: CONTACT_ID }))
      .toBe('[data-copilot-record="\\31 1111111-1111-4111-8111-111111111111"]');
    expect(copilotActionTarget({
      type: 'openRecord',
      recordType: 'contact',
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    })).toBe('[data-copilot-record="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"]');
    expect(isCopilotPanelAction(action)).toBe(true);
    expect(isCopilotPanelAction({ type: 'navigate', page: 'contacts' })).toBe(false);
  });
});

describe('audit shapes copied from chat.ts', () => {
  it('builds a UI row with actor copilot on behalf of Matthew', () => {
    const action = { type: 'navigate' as const, page: 'contacts' as const };
    const row = buildCopilotUiAuditEvent({ sessionId: CONTACT_ID, action, status: 'queued' });
    expect(row).toEqual({
      organizationId: 'apex',
      actorType: 'agent',
      actorId: 'copilot',
      action: 'copilot.ui.navigate',
      entityType: 'dashboard_page',
      entityId: 'contacts',
      metadata: {
        actor: 'copilot',
        onBehalfOf: 'Matthew',
        sessionId: CONTACT_ID,
        status: 'queued',
        action,
        undoAvailable: false,
      },
    });
  });

  it('builds session started and stopped rows', () => {
    const row = buildCopilotSessionAuditEvent({ sessionId: CONTACT_ID, event: 'started', reason: 'toggle' });
    expect(row.action).toBe('copilot.session.started');
    expect(row.actorId).toBe('copilot');
    expect(row.metadata.onBehalfOf).toBe('Matthew');
    expect(row.metadata.actor).toBe('copilot');
    expect(buildCopilotSessionAuditEvent({ sessionId: CONTACT_ID, event: 'stopped' }).action)
      .toBe('copilot.session.stopped');
  });

  it('rejects an action when the queued audit write fails', () => {
    expect(queuedAuditResult('navigate', false)).toEqual({
      ok: false,
      code: 'audit_failed',
      reason: 'Could not queue navigate because its audit event was not recorded.',
    });
    expect(queuedAuditResult('navigate', true)).toEqual({ ok: true });
  });
});

describe('operator session gate', () => {
  it('ignores the admin bearer', () => {
    expect(adminBearerActivatesCopilot()).toBe(false);
    expect(copilotModeAllowed({ featureEnabled: true, operatorSessionValid: false })).toBe(false);
    expect(copilotModeAllowed({ featureEnabled: false, operatorSessionValid: true })).toBe(false);
    expect(copilotModeAllowed({ featureEnabled: true, operatorSessionValid: true })).toBe(true);
  });
});
