import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const repository = 'goodmeasurelabs/aaron-judge';
export const prNumber = 4;
export const sourceSha = 'a1e4696b8561d62edea37c90d2becc5ca38facd0';
export const baseSha = '452895a4c9875ce543a1123a0d49e91e2908d480';
const harnessRef = 'refs/heads/codex/aaron-pr4-manual-release';
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const api = path => JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));

export async function verifyApprovedSource(phase = 'before-upload') {
  assert.equal(process.env.GITHUB_REPOSITORY, repository, 'Unexpected release repository');
  assert.equal(process.env.GITHUB_REF, harnessRef, 'Only the reviewed manual harness branch is allowed');
  assert.equal(process.env.GITHUB_EVENT_NAME, 'workflow_dispatch', 'Only an explicit manual release is allowed');
  assert.equal(git('rev-parse', 'HEAD'), sourceSha, 'Candidate checkout must equal the exact reviewed PR4 commit');
  assert.equal(git('status', '--porcelain', '--untracked-files=no'), '', 'Tracked candidate source changed during build');
  const currentMain = api(`repos/${repository}/git/ref/heads/main`).object.sha;
  const pr = api(`repos/${repository}/pulls/${prNumber}`);
  assert.equal(currentMain, baseSha, 'Main moved after review; rebase and review are required before release');
  assert.equal(pr.state, 'open', 'PR4 must remain open for this pre-merge release');
  assert.equal(pr.head.sha, sourceSha, 'PR4 head moved after review');
  assert.equal(pr.head.repo.full_name, repository, 'Untrusted fork source is not allowed');
  assert.equal(pr.base.ref, 'main', 'PR4 must target main');
  git('merge-base', '--is-ancestor', baseSha, sourceSha);
  const proof = {
    checkedAt: new Date().toISOString(), phase, sourceContext: 'explicitly-authorized-open-pr',
    repository, pullRequest: prNumber, reviewedSourceSha: sourceSha, approvedMainBaseSha: baseSha,
    executionContext: process.env.GITHUB_ACTIONS === 'true' ? 'github-actions' : 'local-read-only-check',
    currentMainSha: currentMain, workflowRevision: process.env.GITHUB_SHA, workflowRef: harnessRef,
    sourceAnnotation: `GitHub commit ${sourceSha}`,
    note: 'The candidate is the reviewed PR4 source, not main and not the temporary harness revision.',
  };
  await mkdir('release-evidence', { recursive: true });
  await writeFile(`release-evidence/source-proof-${phase}.json`, JSON.stringify(proof, null, 2) + '\n');
  console.log(JSON.stringify(proof, null, 2));
  return proof;
}
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  verifyApprovedSource(process.argv[2] || 'initial').catch(error => {
    console.error('Reviewed PR4 source proof failed: ' + error.message);
    process.exitCode = 1;
  });
}
