import { cssEscape } from './css-escape.js';
import type { CopilotAction } from './types.js';

export function describeCopilotAction(action: CopilotAction): string {
  switch (action.type) {
    case 'navigate':
      return `Opening ${action.page.replace(/-/g, ' ')}`;
    case 'search':
      return `Searching ${action.page} for “${action.query}”`;
    case 'setFilter':
      return `Setting ${action.page} filter ${action.field} to ${String(action.value ?? 'any')}`;
    case 'openRecord':
      return `Opening ${action.recordType} ${action.id.slice(0, 8)}`;
  }
}

export function copilotActionTarget(action: CopilotAction): string | null {
  switch (action.type) {
    case 'navigate':
      return `#nav-${cssEscape(action.page)}`;
    case 'search':
      return `[data-copilot-target="${action.page}-search"]`;
    case 'setFilter':
      if (action.field === 'q') return `[data-copilot-target="${action.page}-search"]`;
      return `[data-copilot-target="${action.page}-filter-${cssEscape(action.field)}"]`;
    case 'openRecord':
      return `[data-copilot-record="${cssEscape(action.id)}"]`;
  }
}

export function isCopilotPanelAction(action: CopilotAction): boolean {
  return action.type === 'search' || action.type === 'setFilter' || action.type === 'openRecord';
}
