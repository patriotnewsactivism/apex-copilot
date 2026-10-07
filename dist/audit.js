export function copilotAuditEntity(action) {
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
export function buildCopilotUiAuditEvent(input) {
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
export function buildCopilotSessionAuditEvent(input) {
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
export function queuedAuditResult(actionType, auditWritten) {
    if (auditWritten)
        return { ok: true };
    return {
        ok: false,
        code: 'audit_failed',
        reason: `Could not queue ${actionType} because its audit event was not recorded.`,
    };
}
//# sourceMappingURL=audit.js.map