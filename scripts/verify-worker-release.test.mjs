import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const worker = config.name;
const repository = worker === 'gm-paulskenes' ? 'goodmeasurelabs/paul-skenes' : 'goodmeasurelabs/aaron-judge';
const sha = 'a'.repeat(40);
const script = resolve('scripts/verify-worker-release.mjs');
const fixture = () => ({
  settings: { bindings: [{ name: 'ASSETS', type: 'assets' }, { name: 'EXISTING', type: 'plain_text', text: 'private-value-never-output' }], compatibility_date: '2026-10-04', compatibility_flags: ['nodejs_compat'] },
  version: { annotations: { 'workers/message': `GitHub commit ${sha}` } },
  deployments: { deployments: [{ id: 'rollback-deployment', versions: [{ version_id: 'rollback-version', percentage: 100 }] }] },
});
function run(cwd, values, after = false) {
  const program = `const values = ${JSON.stringify(values)}; globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;
    if (!path.endsWith('/settings') && !path.endsWith('/deployments') && !path.includes('/versions/')) throw new Error('Unexpected broad metadata request: ' + path);
    const result = path.endsWith('/settings') ? values.settings : path.endsWith('/deployments') ? values.deployments : values.version;
    return new Response(JSON.stringify({success:true,result}), {status:200});
  }; ${after ? "process.argv.push('--after');" : ''} await import(${JSON.stringify('file://' + script)});`;
  return spawnSync(process.execPath, ['--input-type=module', '-e', program], {cwd, encoding:'utf8', env: {...process.env, GITHUB_REPOSITORY: repository, GITHUB_REF: 'refs/heads/main', GITHUB_SHA: sha, CLOUDFLARE_DEPLOY_TOKEN: 'fixture-token-never-output'}});
}
function temporary(check) {
  const cwd = mkdtempSync(join(tmpdir(), 'worker-release-test-'));
  try { writeFileSync(join(cwd, 'wrangler.jsonc'), JSON.stringify(config)); check(cwd); }
  finally { rmSync(cwd, {recursive:true, force:true}); }
}

test('records rollback and binding names using only scoped Worker reads without configuration or secret values', () => temporary(cwd => {
  const result = run(cwd, fixture());
  assert.equal(result.status, 0, result.stderr);
  const evidence = readFileSync(join(cwd, 'release-evidence/before.json'), 'utf8');
  assert.match(evidence, /rollback-version/);
  assert.equal(JSON.parse(evidence).routingVerification.mode, 'external-authenticated-ui');
  for (const forbidden of ['private-value-never-output', 'fixture-token-never-output']) {
    assert(!evidence.includes(forbidden)); assert(!result.stdout.includes(forbidden));
  }
}));
test('refuses route configuration and non-text runtime bindings before publishing', () => temporary(cwd => {
  const binding = fixture(); binding.settings.bindings.push({name:'DATABASE',type:'d1'});
  assert.notEqual(run(cwd, binding).status, 0);
  writeFileSync(join(cwd, 'wrangler.jsonc'), JSON.stringify({...config, env: {production: {routes: []}}}));
  assert.notEqual(run(cwd, fixture()).status, 0);
}));
test('requires exact source annotation and unchanged runtime bindings after publishing', () => temporary(cwd => {
  assert.equal(run(cwd, fixture()).status, 0);
  assert.equal(run(cwd, fixture(), true).status, 0);
  const stale = fixture(); stale.version.annotations['workers/message'] = 'other commit'; stale.settings.annotations = {'workers/message': `GitHub commit ${sha}`};
  assert.notEqual(run(cwd, stale, true).status, 0);
  const changed = fixture(); changed.settings.bindings.push({name:'UNEXPECTED',type:'secret_text'});
  assert.notEqual(run(cwd, changed, true).status, 0);
  const observed = JSON.parse(readFileSync(join(cwd, 'release-evidence/after.json'), 'utf8'));
  assert(observed.bindings.some(binding => binding.name === 'UNEXPECTED'), 'failed verification must retain resulting provider state');
}));
