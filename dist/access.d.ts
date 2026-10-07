/**
 * The admin bearer is never an input. A present bearer cannot turn the mode on.
 * The operator session minted by the dashboard password login stays required.
 */
export declare function copilotModeAllowed(input: {
    featureEnabled: boolean;
    operatorSessionValid: boolean;
}): boolean;
export declare function adminBearerActivatesCopilot(): false;
export declare function copilotAccessDecision(input: {
    featureEnabled: boolean;
    operatorSessionValid: boolean;
    requireCapability: boolean;
    capabilityOk: boolean;
}): {
    ok: true;
} | {
    ok: false;
    code: 'disabled' | 'operator_session_required' | 'capability_required';
};
//# sourceMappingURL=access.d.ts.map