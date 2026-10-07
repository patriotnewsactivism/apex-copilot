import { describeCopilotAction } from './client.js';
import type { CopilotAction } from './types.js';

export interface CopilotVoiceReadback {
  type: 'copilot.voice.readback';
  text: string;
  multiStep: boolean;
  confirmBeforeRun: boolean;
  provider: null;
}

function clause(action: CopilotAction): string {
  const narration = describeCopilotAction(action);
  return narration.charAt(0).toLowerCase() + narration.slice(1);
}

/**
 * Text the dashboard can speak later. This package does not call a voice provider.
 */
export function copilotVoiceReadback(actions: readonly CopilotAction[]): CopilotVoiceReadback {
  if (actions.length === 0) {
    return {
      type: 'copilot.voice.readback',
      text: 'Nothing to do.',
      multiStep: false,
      confirmBeforeRun: false,
      provider: null,
    };
  }
  const steps = actions.map(clause);
  const body = steps.length === 1
    ? steps[0] ?? ''
    : steps.length === 2
      ? `${steps[0]} and ${steps[1]}`
      : `${steps.slice(0, -1).join(', ')}, and ${steps[steps.length - 1]}`;
  const multiStep = actions.length > 1;
  return {
    type: 'copilot.voice.readback',
    text: multiStep ? `I'll ${body}. Go?` : `I'll ${body}.`,
    multiStep,
    confirmBeforeRun: multiStep,
    provider: null,
  };
}
