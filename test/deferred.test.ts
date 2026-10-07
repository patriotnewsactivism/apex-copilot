import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  COPILOT_MEDIUM_RISK_ACTIONS,
  capabilityAuthorizesSend,
  copilotAccessDecision,
  copilotVoiceReadback,
  createCopilotCapabilityStore,
  createCopilotRateLimiter,
  createDoItChallenge,
  mediumRiskActionAvailability,
  satisfyDoItChallenge,
  undoForCopilotAction,
  validateCopilotAction,
} from '../src/index.js';

const SESSION = 'operator-session';
const TAB = 'tab-a';
const SECRET = 'server-bound-test-secret';

describe('capability tokens', () => {
  const store = () => createCopilotCapabilityStore({ serverSecret: SECRET, now: () => 1_000 });

  it('requires the operator session and the issuing tab, and never authorizes a send', () => {
    const issued = store().issue({ operatorSessionId: SESSION, tabId: TAB });
    const ok = store();
    const token = ok.issue({ operatorSessionId: SESSION, tabId: TAB }).token;
    const verified = ok.verify({ token, operatorSessionId: SESSION, tabId: TAB });
    expect(verified.ok).toBe(true);
    if (verified.ok) {
      expect(verified.operatorSessionStillRequired).toBe(true);
      expect(verified.authorizesSend).toBe(false);
      expect(verified.claims.scope).toBe('dashboard-control');
    }
    expect(capabilityAuthorizesSend(verified)).toBe(false);
    expect(ok.verify({ token, operatorSessionId: 'other', tabId: TAB }).ok).toBe(false);
    expect(ok.verify({ token, operatorSessionId: SESSION, tabId: 'other-tab' }).ok).toBe(false);
    expect(issued.claims.expiresAt - issued.claims.issuedAt).toBe(15 * 60_000);
  });

  it('does not replace the operator session when Apex has not wired the token', () => {
    expect(copilotAccessDecision({
      featureEnabled: true,
      operatorSessionValid: true,
      requireCapability: false,
      capabilityOk: false,
    }).ok).toBe(true);
    expect(copilotAccessDecision({
      featureEnabled: true,
      operatorSessionValid: false,
      requireCapability: false,
      capabilityOk: true,
    })).toEqual({ ok: false, code: 'operator_session_required' });
    expect(copilotAccessDecision({
      featureEnabled: true,
      operatorSessionValid: false,
      requireCapability: true,
      capabilityOk: true,
    })).toEqual({ ok: false, code: 'operator_session_required' });
  });

  it('renews only a live token and kills the previous id', () => {
    const live = store();
    const first = live.issue({ operatorSessionId: SESSION, tabId: TAB });
    const renewed = live.renew({ token: first.token, operatorSessionId: SESSION, tabId: TAB });
    expect(renewed.ok).toBe(true);
    expect(live.verify({ token: first.token, operatorSessionId: SESSION, tabId: TAB }).ok).toBe(false);
    if (renewed.ok) {
      expect(live.verify({ token: renewed.token, operatorSessionId: SESSION, tabId: TAB }).ok).toBe(true);
    }
  });
});

describe('rate limits', () => {
  it('allows 30 actions in a minute and 200 in a session, then stops', () => {
    let clock = 0;
    const limiter = createCopilotRateLimiter(() => clock);
    expect(limiter.consume('s', 30).ok).toBe(true);
    const minute = limiter.consume('s', 1);
    expect(minute.ok).toBe(false);
    if (!minute.ok) expect(minute.code).toBe('rate_limited_minute');
    expect(minute.minuteCount).toBe(30);
    for (let minuteIndex = 1; minuteIndex <= 5; minuteIndex += 1) {
      clock = minuteIndex * 60_000;
      expect(limiter.consume('s', 30).ok).toBe(true);
    }
    clock = 6 * 60_000;
    expect(limiter.consume('s', 20).ok).toBe(true);
    const session = limiter.consume('s', 1);
    expect(session.ok).toBe(false);
    if (!session.ok) expect(session.code).toBe('rate_limited_session');
    expect(session.sessionCount).toBe(200);
  });

  it('does not consume a batch that would cross the minute cap', () => {
    const limiter = createCopilotRateLimiter(() => 0);
    expect(limiter.consume('s', 25).ok).toBe(true);
    expect(limiter.consume('s', 10).ok).toBe(false);
    expect(limiter.consume('s', 5).ok).toBe(true);
  });
});

describe('undo descriptors', () => {
  it('describes an inverse only when that inverse is itself allowed', () => {
    const navigate = undoForCopilotAction(
      { type: 'navigate', page: 'contacts' },
      { page: 'leads' },
    );
    expect(navigate).toEqual({ reversible: true, inverse: { type: 'navigate', page: 'leads' } });

    const filter = undoForCopilotAction(
      { type: 'setFilter', page: 'contacts', field: 'city', value: 'Houston' },
      { valueKnown: true, value: null },
    );
    expect(filter.reversible).toBe(true);

    expect(undoForCopilotAction({ type: 'openRecord', recordType: 'contact', id: '11111111-1111-4111-8111-111111111111' }).reversible)
      .toBe(false);
    expect(undoForCopilotAction({ type: 'search', page: 'leads', query: 'radio' }).reversible).toBe(false);
    expect(undoForCopilotAction(
      { type: 'search', page: 'leads', query: 'radio' },
      { query: 'news' },
    ).reversible).toBe(true);
    expect(undoForCopilotAction(
      { type: 'navigate', page: 'contacts' },
      { page: 'settings' as never },
    ).reversible).toBe(false);
  });
});

describe('Do it? challenge', () => {
  it('refuses the model even when the model has the proof', () => {
    const record = createDoItChallenge('editCampaign', 0);
    expect(JSON.stringify(record.publicChallenge)).not.toContain(record.proof);
    const model = satisfyDoItChallenge(record, { actor: 'model', proof: record.proof, now: 0 });
    expect(model).toEqual({ ok: false, code: 'model_cannot_satisfy' });
    expect(satisfyDoItChallenge(record, { actor: 'copilot', proof: record.proof, now: 0 }).ok).toBe(false);
    expect(satisfyDoItChallenge(record, { actor: 'agent', proof: record.proof, now: 0 }).ok).toBe(false);
    const human = satisfyDoItChallenge(record, { actor: 'human', proof: record.proof, now: 0 });
    expect(human.ok).toBe(true);
  });

  it('keeps campaign edits, bulk edits, and merges unavailable', () => {
    for (const entry of COPILOT_MEDIUM_RISK_ACTIONS) {
      const validated = validateCopilotAction({ type: entry.type });
      expect(validated.ok).toBe(false);
      const availability = mediumRiskActionAvailability(entry.type, { ok: true });
      expect(availability.available).toBe(false);
      if (entry.type === 'mergeContacts') {
        expect(availability.code).toBe('hard_denied');
        if (!validated.ok) expect(validated.code).toBe('denied');
      } else if (!validated.ok) {
        expect(validated.code).toBe('not_allowed');
        expect(availability.code).toBe('not_wired');
      }
    }
  });
});

describe('voice readback', () => {
  it('returns text and no provider', () => {
    const event = copilotVoiceReadback([
      { type: 'setFilter', page: 'contacts', field: 'city', value: 'Houston' },
      { type: 'openRecord', recordType: 'contact', id: '11111111-1111-4111-8111-111111111111' },
    ]);
    expect(event.provider).toBeNull();
    expect(event.type).toBe('copilot.voice.readback');
    expect(event.confirmBeforeRun).toBe(true);
    expect(event.text.startsWith("I'll ")).toBe(true);
    expect(event.text.endsWith('Go?')).toBe(true);
    const source = readFileSync(new URL('../src/readback.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(/openai|elevenlabs|cartesia|deepgram|speechSynthesis/i);
  });
});
