import { isCopilotClientFeatureEnabled } from './client-flag.js';
import { COPILOT_SERVER_FLAG } from './types.js';
/**
 * Server gate. Unset, empty, and every value other than the trimmed lowercase
 * string "true" fail closed.
 */
export function isCopilotFeatureEnabled(env = process.env) {
    return env[COPILOT_SERVER_FLAG]?.trim().toLowerCase() === 'true';
}
export { isCopilotClientFeatureEnabled };
//# sourceMappingURL=flags.js.map