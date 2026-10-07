import type { CopilotAction } from './types.js';
export interface CopilotVoiceReadback {
    type: 'copilot.voice.readback';
    text: string;
    multiStep: boolean;
    confirmBeforeRun: boolean;
    provider: null;
}
/**
 * Text the dashboard can speak later. This package does not call a voice provider.
 */
export declare function copilotVoiceReadback(actions: readonly CopilotAction[]): CopilotVoiceReadback;
//# sourceMappingURL=readback.d.ts.map