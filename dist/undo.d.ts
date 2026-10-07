import type { CopilotAction, CopilotSafePage } from './types.js';
export type CopilotUndo = {
    reversible: true;
    inverse: CopilotAction;
} | {
    reversible: false;
    reason: string;
};
export interface CopilotUndoPrior {
    page?: CopilotSafePage;
    query?: string;
    value?: string | boolean | null;
    valueKnown?: boolean;
}
/**
 * Undo descriptors only. Nothing is applied.
 * openRecord has no inverse. Search can be restored only to a non-empty query.
 * setFilter and navigate are reversible only when the prior value itself validates.
 */
export declare function undoForCopilotAction(action: CopilotAction, prior?: CopilotUndoPrior): CopilotUndo;
//# sourceMappingURL=undo.d.ts.map