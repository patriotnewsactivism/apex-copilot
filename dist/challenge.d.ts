export declare const COPILOT_DO_IT_TTL_MS: number;
export declare const COPILOT_DO_IT_PROMPT: "Do it?";
export declare const COPILOT_MEDIUM_RISK_ACTIONS: readonly [{
    readonly type: "editCampaign";
    readonly label: "campaign edit";
}, {
    readonly type: "bulkEdit";
    readonly label: "bulk edit";
}, {
    readonly type: "mergeContacts";
    readonly label: "merge";
}];
export interface DoItChallengePublic {
    id: string;
    prompt: typeof COPILOT_DO_IT_PROMPT;
    actionType: string;
    expiresAt: number;
}
export interface DoItChallengeRecord {
    publicChallenge: DoItChallengePublic;
    proof: string;
}
export type DoItActor = 'human' | 'model' | 'agent' | 'copilot';
export declare function createDoItChallenge(actionType: string, now?: number): DoItChallengeRecord;
export declare function satisfyDoItChallenge(record: DoItChallengeRecord, input: {
    actor: DoItActor;
    proof: string;
    now?: number;
}): {
    ok: true;
    challengeId: string;
} | {
    ok: false;
    code: 'model_cannot_satisfy' | 'bad_proof' | 'expired';
};
/**
 * A satisfied human challenge still does not make the action available.
 * Apex has not wired the challenge into a dashboard control.
 * Names that hit the shipped deny list stay hard-denied.
 */
export declare function mediumRiskActionAvailability(actionType: string, satisfaction: {
    ok: boolean;
}): {
    available: false;
    code: 'hard_denied' | 'not_wired';
    reason: string;
};
//# sourceMappingURL=challenge.d.ts.map