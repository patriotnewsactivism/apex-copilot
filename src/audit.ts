import type { CopilotAction } from './types.js';

export type CopilotUiAuditStatus = 'queued' | 'executed' | 'failed' | 'stopped';
export type CopilotSessionAuditEvent = 'started' | 'stopped';

export interface CopilotUiAuditEvent {
  organizationId: 'apex';
  actorType: 'agent';
  actorId: 'copilot';
  action: `copilot.ui.${CopilotAction['type']}`;
  entityType: string;
  entityId: string | null;
  metadata: {
    actor: 'copilot';
    onBehalfOf: 'Matthew';
    sessionId: string;
    status: CopilotUiAuditStatus;
    action: CopilotAction;
    undoAvailable: false;
    reason?: string;
  };
}

export interface CopilotSessionAuditEventRow {
  organizationId: 'apex';
  actorType: 'agent';
  actorId: 'copilot';
  action: `copilot.session.${CopilotSessionAuditEvent}`;
  entityType: 'copilot_session';
  entityId: string;
  metadata: {
    actor: 'copilot';
    onBehalfOf: 'Matthew';
    reason: string | undefined;
  };
}

export function copilotAuditEntity(action: CopilotAction): { entityType: string; entityId: string | null } {
  switch (action.type) {
    case 'navigate':
    case 'search':
    case 'setFilter':
      return { entityType: 'dashboard_page', entityId: action.page };
    case 'openRecord':
      return { entityType: action.recordType, entityId: action.id };
  }
}

/** Shape written by chat.ts writeCopilotAudit. undoAvailable stays false until Apex wires undo. */
export function buildCopilotUiAuditEvent(input: {
  sessionId: string;
  action: CopilotAction;
  status: CopilotUiAuditStatus;
  reason?: string;
}): CopilotUiAuditEvent {
  const entity = copilotAuditEntity(input.action);
  return {
    organizationId: 'apex',
    actorType: 'agent',
    actorId: 'copilot',
    action: `copilot.ui.${input.action.type}`,
    entityType: entity.entityType,
    entityId: entity.entityId,
    metadata: {
      actor: 'copilot',
      onBehalfOf: 'Matthew',
      sessionId: input.sessionId,
      status: input.status,
      action: input.action,
      undoAvailable: false,
      ...(input.reason ? { reason: input.reason } : {}),
    },
  };
}

/** Shape written by POST /copilot/session-audit. */
export function buildCopilotSessionAuditEvent(input: {
  sessionId: string;
  event: CopilotSessionAuditEvent;
  reason?: string;
}): CopilotSessionAuditEventRow {
  return {
    organizationId: 'apex',
    actorType: 'agent',
    actorId: 'copilot',
    action: `copilot.session.${input.event}`,
    entityType: 'copilot_session',
    entityId: input.sessionId,
    metadata: {
      actor: 'copilot',
      onBehalfOf: 'Matthew',
      reason: input.reason,
    },
  };
}

/** A queued audit write that fails rejects the action. Apex already does this in chat.ts. */
export function queuedAuditResult(
  actionType: string,
  auditWritten: boolean,
): { ok: true } | { ok: false; code: 'audit_failed'; reason: string } {
  if (auditWritten) return { ok: true };
  return {
    ok: false,
    code: 'audit_failed',
    reason: `Could not queue ${actionType} because its audit event was not recorded.`,
  };
}
