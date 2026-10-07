/**
 * The admin bearer is never an input. A present bearer cannot turn the mode on.
 * The operator session minted by the dashboard password login stays required.
 */
export function copilotModeAllowed(input) {
    return input.featureEnabled === true && input.operatorSessionValid === true;
}
export function adminBearerActivatesCopilot() {
    return false;
}
export function copilotAccessDecision(input) {
    if (!input.featureEnabled)
        return { ok: false, code: 'disabled' };
    if (!input.operatorSessionValid)
        return { ok: false, code: 'operator_session_required' };
    if (input.requireCapability && !input.capabilityOk)
        return { ok: false, code: 'capability_required' };
    return { ok: true };
}
//# sourceMappingURL=access.js.map