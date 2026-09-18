#!/usr/bin/env node
/**
 * Runs the ngrx-traits skill eval suite (evals/) with `claude plugin eval`.
 *
 * The CLI refuses to scan a plugin root with more than 20k entries, and this repo
 * goes past that as soon as apps/docs/node_modules is installed. So the skill, the
 * plugin manifest and the cases are copied into a throwaway root outside the repo
 * (symlinks are rejected by the CLI) and the run happens there. Results are written
 * back to evals/results/<timestamp>/.
 *
 * Any extra arguments are passed through to `claude plugin eval`, e.g.
 *   pnpm eval:skill --case remote-list --runs 3
 */
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = join(repo, 'evals', 'results', stamp);
const root = mkdtempSync(join(tmpdir(), 'ngrx-traits-eval-'));

try {
  cpSync(join(repo, '.claude-plugin'), join(root, '.claude-plugin'), {
    recursive: true,
  });
  cpSync(join(repo, 'skills', 'ngrx-traits'), join(root, 'skills', 'ngrx-traits'), {
    recursive: true,
  });
  cpSync(join(repo, 'evals'), join(root, 'evals'), {
    recursive: true,
    filter: (src) => !src.includes(`${join('evals', 'results')}`),
  });
  mkdirSync(outDir, { recursive: true });

  const { status } = spawnSync(
    'claude',
    [
      'plugin',
      'eval',
      '.',
      '--trust-plugin',
      '--output-dir',
      outDir,
      '--report',
      join(outDir, 'report.html'),
      ...process.argv.slice(2),
    ],
    { cwd: root, stdio: 'inherit' },
  );
  process.exit(status ?? 1);
} finally {
  rmSync(root, { recursive: true, force: true });
}
