import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  SHIPPED_CONTACT_FILTERS,
  SHIPPED_CONTROL_TOOL,
  SHIPPED_DENY_TOKENS,
  SHIPPED_EXCLUDED_PAGES,
  SHIPPED_HARD_DENY_ACTIONS,
  SHIPPED_LEAD_FILTERS,
  SHIPPED_READ_ONLY_TOOLS,
  SHIPPED_SAFE_PAGES,
} from '../fixtures/shipped-contract.js';
import {
  COPILOT_CONTACT_FILTERS,
  COPILOT_CONTROL_TOOL_NAME,
  COPILOT_DENY_TOKENS,
  COPILOT_EXCLUDED_PAGES,
  COPILOT_HARD_DENY_ACTIONS,
  COPILOT_LEAD_FILTERS,
  COPILOT_READ_ONLY_CHAT_TOOL_NAMES,
  COPILOT_SAFE_PAGES,
  isCopilotChatToolAllowed,
  isCopilotFeatureEnabled,
  validateCopilotAction,
} from '../src/index.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

function walk(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, found);
    else found.push(path);
  }
  return found;
}

describe('shipped Apex fixture', () => {
  it('keeps the default flag off', () => {
    expect(isCopilotFeatureEnabled({})).toBe(false);
  });

  it('matches the safe pages copied from Apex', () => {
    expect([...COPILOT_SAFE_PAGES]).toEqual([...SHIPPED_SAFE_PAGES]);
  });

  it('matches the deny-list tokens copied from Apex', () => {
    expect([...COPILOT_DENY_TOKENS]).toEqual([...SHIPPED_DENY_TOKENS]);
  });

  it('matches the allowed chat tools copied from Apex', () => {
    expect([...COPILOT_READ_ONLY_CHAT_TOOL_NAMES]).toEqual([...SHIPPED_READ_ONLY_TOOLS]);
    expect(COPILOT_CONTROL_TOOL_NAME).toBe(SHIPPED_CONTROL_TOOL);
    const allowed = [...SHIPPED_READ_ONLY_TOOLS, SHIPPED_CONTROL_TOOL];
    for (const tool of allowed) expect(isCopilotChatToolAllowed(tool)).toBe(true);
    expect(isCopilotChatToolAllowed('create_goal')).toBe(false);
  });

  it('matches the shipped hard-deny names, filters, and excluded pages', () => {
    expect([...COPILOT_HARD_DENY_ACTIONS]).toEqual([...SHIPPED_HARD_DENY_ACTIONS]);
    expect([...COPILOT_CONTACT_FILTERS]).toEqual([...SHIPPED_CONTACT_FILTERS]);
    expect([...COPILOT_LEAD_FILTERS]).toEqual([...SHIPPED_LEAD_FILTERS]);
    expect([...COPILOT_EXCLUDED_PAGES]).toEqual([...SHIPPED_EXCLUDED_PAGES]);
    expect(COPILOT_CONTACT_FILTERS).not.toContain('doNotContact');
    for (const page of SHIPPED_EXCLUDED_PAGES) {
      expect(COPILOT_SAFE_PAGES).not.toContain(page);
      const result = validateCopilotAction({ type: 'navigate', page });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('not_allowed');
    }
  });

  it('does not assign either flag to true outside the local-dev example', () => {
    const assignment = /^(?:export\s+)?(?:FEATURE_COPILOT|VITE_FEATURE_COPILOT)\s*=\s*true\s*$/m;
    let sawExample = false;
    for (const file of walk(ROOT)) {
      const rel = relative(ROOT, file);
      const text = readFileSync(file, 'utf8');
      if (rel === 'examples/local-dev.env') {
        sawExample = true;
        expect(text).toContain('NOT PRODUCTION');
        expect(text).toMatch(assignment);
        continue;
      }
      expect(text, rel).not.toMatch(assignment);
    }
    expect(sawExample).toBe(true);
    const exampleText = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
    expect(exampleText).toMatch(/^FEATURE_COPILOT=false$/m);
    expect(exampleText).toMatch(/^VITE_FEATURE_COPILOT=false$/m);
  });

  it('keeps the shipped fixture out of the implementation', () => {
    const srcDir = fileURLToPath(new URL('../src', import.meta.url));
    for (const file of walk(srcDir)) {
      const text = readFileSync(file, 'utf8');
      expect(text, relative(ROOT, file)).not.toMatch(/shipped-contract|fixtures\//);
    }
  });

  it('keeps Node and Zod out of the dashboard entry', () => {
    const clientFiles = [
      'src/client-entry.ts',
      'src/client.ts',
      'src/client-flag.ts',
      'src/css-escape.ts',
      'src/types.ts',
    ];
    for (const rel of clientFiles) {
      const text = readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
      expect(text, rel).not.toMatch(/from ['"]zod['"]|node:crypto|from ['"]\.\/flags\.js['"]|process\.env/);
    }
  });
});
