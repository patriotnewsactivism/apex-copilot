/** Build-time gate for the Apex Copilot UI. Unset and non-true values fail closed. */
export function isCopilotClientFeatureEnabled(value) {
    return typeof value === 'string' && value.trim().toLowerCase() === 'true';
}
//# sourceMappingURL=client-flag.js.map