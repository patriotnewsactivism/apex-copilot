import { z } from 'zod';
import { COPILOT_HARD_DENY_ACTIONS, type CopilotAction } from './types.js';
export declare const copilotActionSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"navigate">;
    page: z.ZodEnum<["command" | "chat" | "mission" | "agents" | "tasks" | "leads" | "contacts" | "territories" | "webinars" | "artifacts" | "scheduled" | "suggestions" | "logs" | "health" | "learning" | "multiapp" | "verify-scale", ...("command" | "chat" | "mission" | "agents" | "tasks" | "leads" | "contacts" | "territories" | "webinars" | "artifacts" | "scheduled" | "suggestions" | "logs" | "health" | "learning" | "multiapp" | "verify-scale")[]]>;
}, "strict", z.ZodTypeAny, {
    type: "navigate";
    page: "command" | "chat" | "mission" | "agents" | "tasks" | "leads" | "contacts" | "territories" | "webinars" | "artifacts" | "scheduled" | "suggestions" | "logs" | "health" | "learning" | "multiapp" | "verify-scale";
}, {
    type: "navigate";
    page: "command" | "chat" | "mission" | "agents" | "tasks" | "leads" | "contacts" | "territories" | "webinars" | "artifacts" | "scheduled" | "suggestions" | "logs" | "health" | "learning" | "multiapp" | "verify-scale";
}>, z.ZodObject<{
    type: z.ZodLiteral<"search">;
    page: z.ZodEnum<["leads", "contacts"]>;
    query: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "search";
    page: "leads" | "contacts";
    query: string;
}, {
    type: "search";
    page: "leads" | "contacts";
    query: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"setFilter">;
    page: z.ZodEnum<["leads", "contacts"]>;
    field: z.ZodString;
    value: z.ZodUnion<[z.ZodString, z.ZodBoolean, z.ZodNull]>;
}, "strict", z.ZodTypeAny, {
    type: "setFilter";
    value: string | boolean | null;
    page: "leads" | "contacts";
    field: string;
}, {
    type: "setFilter";
    value: string | boolean | null;
    page: "leads" | "contacts";
    field: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"openRecord">;
    recordType: z.ZodLiteral<"contact">;
    id: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "openRecord";
    id: string;
    recordType: "contact";
}, {
    type: "openRecord";
    id: string;
    recordType: "contact";
}>]>;
export declare function isCopilotChatToolAllowed(toolName: string): boolean;
export type CopilotActionValidation = {
    ok: true;
    action: CopilotAction;
} | {
    ok: false;
    code: 'denied' | 'invalid' | 'not_allowed';
    reason: string;
    actionType?: string;
};
export declare function isHardDeniedCopilotAction(actionType: string): boolean;
export declare function validateCopilotAction(input: unknown): CopilotActionValidation;
export declare function validateCopilotActions(input: unknown): {
    actions: CopilotAction[];
    rejected: Array<Exclude<CopilotActionValidation, {
        ok: true;
    }>>;
};
export { COPILOT_HARD_DENY_ACTIONS };
//# sourceMappingURL=registry.d.ts.map