import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const worker = config.name;
const domain = worker === 'gm-paulskenes' ? 'paulskenes.com' : 'aaronjudge.net';
const repository = worker === 'gm-paulskenes' ? 'goodmeasurelabs/paul-skenes' : 'goodmeasurelabs/aaron-judge';
const sha = 'a'.repeat(40);
const script = resolve('scripts/verify-worker-release.mjs');
const fixture = () => ({
  settings: { bindings: [{ name: 'ASSETS', type: 'assets' }, { name: 'EXISTING', type: 'plain_text', text: 'private-value-never-output' }], compatibility_date: '2026-10-04', compatibility_flags: ['nodejs_compat'] },
  version: { annotations: { 'workers/message': `GitHub commit ${sha}` } },
  deployments: { deployments: [{ id: 'rollback-deployment', versions: [{ version_id: 'rollback-version', percentage: 100 }] }] },
  domains: [{ id: 'domain-id', hostname: domain, service: worker, environment: 'production', zone_id: 'zone-id' }],
  routes: [{ id: 'route-id', pattern: `www.${domain}/*`, script: worker }],
});
function run(cwd, values, after = false) {
  const program = `const values = ${JSON.stringify(values)}; globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;
    const result = path.endsWith('/settings') ? values.settings : path.endsWith('/deployments') ? values.deployments : path.endsWith('/domains') ? values.domains : path.includes('/versions/') ? values.version : values.routes;
    return new Response(JSON.stringify({success:true,result}), {status:200});
  }; ${after ? "process.argv.push('--after');" : ''} await import(${JSON.stringify('file://' + script)});`;
  return spawnSync(process.execPath, ['--input-type=module', '-e', program], {cwd, encoding:'utf8', env: {...process.env, GITHUB_REPOSITORY: repository, GITHUB_REF: 'refs/heads/main', GITHUB_SHA: sha, CLOUDFLARE_DEPLOY_TOKEN: 'fixture-token-never-output'}});
}
function temporary(check) {
  const cwd = mkdtempSync(join(tmpdir(), 'worker-release-test-'));
  try { writeFileSync(join(cwd, 'wrangler.jsonc'), JSON.stringify(config)); check(cwd); }
  finally { rmSync(cwd, {recursive:true, force:true}); }
}

test('records rollback, domains, routes and binding names without configuration or secret values', () => temporary(cwd => {
  const result = run(cwd, fixture());
  assert.equal(result.status, 0, result.stderr);
  const evidence = readFileSync(join(cwd, 'release-evidence/before.json'), 'utf8');
  assert.match(evidence, /rollback-version/);
  for (const forbidden of ['private-value-never-output', 'fixture-token-never-output']) {
    assert(!evidence.includes(forbidden)); assert(!result.stdout.includes(forbidden));
  }
}));
test('refuses an unrelated domain and non-text runtime binding before publishing', () => temporary(cwd => {
  const other = fixture(); other.domains[0].hostname = 'unrelated.example';
  assert.notEqual(run(cwd, other).status, 0);
  const binding = fixture(); binding.settings.bindings.push({name:'DATABASE',type:'d1'});
  assert.notEqual(run(cwd, binding).status, 0);
}));
test('requires exact source annotation and unchanged runtime/domain/route metadata after publishing', () => temporary(cwd => {
  assert.equal(run(cwd, fixture()).status, 0);
  assert.equal(run(cwd, fixture(), true).status, 0);
  const stale = fixture(); stale.version.annotations['workers/message'] = 'other commit'; stale.settings.annotations = {'workers/message': `GitHub commit ${sha}`};
  assert.notEqual(run(cwd, stale, true).status, 0);
  const changed = fixture(); changed.routes[0].pattern = `other.${domain}/*`;
  assert.notEqual(run(cwd, changed, true).status, 0);
  const observed = JSON.parse(readFileSync(join(cwd, 'release-evidence/after.json'), 'utf8'));
  assert.equal(observed.routes[0].pattern, `other.${domain}/*`, 'failed verification must retain resulting provider state');
}));
