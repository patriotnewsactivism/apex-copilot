export const COPILOT_UNSUPPORTED_CONTROLS = [
  {
    type: 'fillField',
    signature: 'fillField(formId, field, value)',
    status: 'unsupported',
    reason: 'No registered dashboard form control exists for fillField.',
  },
  {
    type: 'setLayout',
    signature: 'setLayout(...)',
    status: 'unsupported',
    reason: 'No registered dashboard layout control exists for setLayout.',
  },
] as const;

export function unsupportedControl(type: string): (typeof COPILOT_UNSUPPORTED_CONTROLS)[number] | null {
  return COPILOT_UNSUPPORTED_CONTROLS.find((entry) => entry.type === type) ?? null;
}

/**
 * GET /api/leads/:id on Apex main 2a83f6a selects id, status, and pipelineState
 * and responds `{ success: true, id, status, pipelineState }`.
 * That is not a record the dashboard can open, so lead openRecord stays unsupported.
 */
export const LEAD_OPEN_RECORD = {
  supported: false,
  method: 'GET',
  path: '/api/leads/:id',
  responseFields: ['success', 'id', 'status', 'pipelineState'],
  reason: 'Apex GET /api/leads/:id returns only id, status, and pipelineState, plus a success flag. Lead openRecord stays unsupported.',
} as const;
