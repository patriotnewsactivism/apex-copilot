/**
 * The admin bearer is never an input. A present bearer cannot turn the mode on.
 * The operator session minted by the dashboard password login stays required.
 */
export function copilotModeAllowed(input: {
  featureEnabled: boolean;
  operatorSessionValid: boolean;
}): boolean {
  return input.featureEnabled === true && input.operatorSessionValid === true;
}

export function adminBearerActivatesCopilot(): false {
  return false;
}

export function copilotAccessDecision(input: {
  featureEnabled: boolean;
  operatorSessionValid: boolean;
  requireCapability: boolean;
  capabilityOk: boolean;
}): { ok: true } | { ok: false; code: 'disabled' | 'operator_session_required' | 'capability_required' } {
  if (!input.featureEnabled) return { ok: false, code: 'disabled' };
  if (!input.operatorSessionValid) return { ok: false, code: 'operator_session_required' };
  if (input.requireCapability && !input.capabilityOk) return { ok: false, code: 'capability_required' };
  return { ok: true };
}
