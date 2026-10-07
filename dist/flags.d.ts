import { isCopilotClientFeatureEnabled } from './client-flag.js';
/**
 * Server gate. Unset, empty, and every value other than the trimmed lowercase
 * string "true" fail closed.
 */
export declare function isCopilotFeatureEnabled(env?: Readonly<Record<string, string | undefined>>): boolean;
export { isCopilotClientFeatureEnabled };
//# sourceMappingURL=flags.d.ts.map