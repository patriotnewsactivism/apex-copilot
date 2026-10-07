export declare const COPILOT_UNSUPPORTED_CONTROLS: readonly [{
    readonly type: "fillField";
    readonly signature: "fillField(formId, field, value)";
    readonly status: "unsupported";
    readonly reason: "No registered dashboard form control exists for fillField.";
}, {
    readonly type: "setLayout";
    readonly signature: "setLayout(...)";
    readonly status: "unsupported";
    readonly reason: "No registered dashboard layout control exists for setLayout.";
}];
export declare function unsupportedControl(type: string): (typeof COPILOT_UNSUPPORTED_CONTROLS)[number] | null;
/**
 * GET /api/leads/:id on Apex main 2a83f6a selects id, status, and pipelineState
 * and responds `{ success: true, id, status, pipelineState }`.
 * That is not a record the dashboard can open, so lead openRecord stays unsupported.
 */
export declare const LEAD_OPEN_RECORD: {
    readonly supported: false;
    readonly method: "GET";
    readonly path: "/api/leads/:id";
    readonly responseFields: readonly ["success", "id", "status", "pipelineState"];
    readonly reason: "Apex GET /api/leads/:id returns only id, status, and pipelineState, plus a success flag. Lead openRecord stays unsupported.";
};
//# sourceMappingURL=unsupported.d.ts.map