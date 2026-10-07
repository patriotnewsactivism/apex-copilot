import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const distReady = existsSync(new URL('../dist/index.js', import.meta.url))
  && existsSync(new URL('../dist/client-entry.js', import.meta.url));

let typescriptPresent = false;
try {
  require.resolve('typescript');
  typescriptPresent = true;
} catch {
  typescriptPresent = false;
}

if (!typescriptPresent) {
  if (distReady) process.exit(0);
  console.error('apex-copilot: typescript is not installed and dist/ is missing.');
  process.exit(1);
}

const result = spawnSync('tsc', ['-p', 'tsconfig.json'], { stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(result.status ?? 1);
