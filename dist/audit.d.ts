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
export declare function copilotAuditEntity(action: CopilotAction): {
    entityType: string;
    entityId: string | null;
};
/** Shape written by chat.ts writeCopilotAudit. undoAvailable stays false until Apex wires undo. */
export declare function buildCopilotUiAuditEvent(input: {
    sessionId: string;
    action: CopilotAction;
    status: CopilotUiAuditStatus;
    reason?: string;
}): CopilotUiAuditEvent;
/** Shape written by POST /copilot/session-audit. */
export declare function buildCopilotSessionAuditEvent(input: {
    sessionId: string;
    event: CopilotSessionAuditEvent;
    reason?: string;
}): CopilotSessionAuditEventRow;
/** A queued audit write that fails rejects the action. Apex already does this in chat.ts. */
export declare function queuedAuditResult(actionType: string, auditWritten: boolean): {
    ok: true;
} | {
    ok: false;
    code: 'audit_failed';
    reason: string;
};
//# sourceMappingURL=audit.d.ts.map