import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const account = 'ee641897681cddb2b23b18fb4b639034';
const projects = {
  'gm-paulskenes': { repository: 'goodmeasurelabs/paul-skenes', domain: 'paulskenes.com' },
  'gm-aaronjudge': { repository: 'goodmeasurelabs/aaron-judge', domain: 'aaronjudge.net' },
};
const token = process.env.CLOUDFLARE_DEPLOY_TOKEN;
async function main() {
  const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
  const expected = projects[config.name];
  assert(expected && process.env.GITHUB_REPOSITORY === expected.repository, 'Unexpected repository or Worker');
  assert.equal(process.env.GITHUB_REF, 'refs/heads/main', 'Production checks require main');
  assert.equal(config.compatibility_date, '2026-10-04');
  assert.equal(config.assets?.binding, 'ASSETS');
  const hasRoutingConfig = value => value && typeof value === 'object' && Object.entries(value).some(([key, child]) => ['route', 'routes', 'custom_domain', 'zone_id', 'zone_name'].includes(key) || hasRoutingConfig(child));
  assert(!hasRoutingConfig(config), 'CI must not manage domain routes');
  assert(token, 'Missing existing CLOUDFLARE_DEPLOY_TOKEN');
  async function api(path) {
    const response = await fetch('https://api.cloudflare.com/client/v4' + path, {
      headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000),
    });
    const body = await response.json();
    assert(response.ok && body.success, `Cloudflare metadata read ${path} failed: HTTP ${response.status}; codes ${(body.errors || []).map(error => error.code).join(',')}`);
    return body.result;
  }
  const base = `/accounts/${account}/workers/scripts/${config.name}`;
  const [settings, deployments] = await Promise.all([
    api(base + '/settings'), api(base + '/deployments'),
  ]);
  const bindings = (settings.bindings || []).map(({ name, type }) => ({ name, type })).sort((a, b) => a.name.localeCompare(b.name));
  assert(bindings.every(binding => ['assets', 'plain_text', 'secret_text'].includes(binding.type)), 'Existing non-text runtime bindings require explicit configuration review before publishing');
  const active = deployments.deployments?.[0];
  assert(active?.id && active.versions?.length, 'Missing active deployment/rollback version');
  assert.equal(settings.compatibility_date, config.compatibility_date, 'Existing compatibility date requires review');
  assert.deepEqual([...(settings.compatibility_flags || [])].sort(), [...(config.compatibility_flags || [])].sort(), 'Existing compatibility flags require review');
  const snapshot = {
    checkedAt: new Date().toISOString(), accountId: account, workerName: config.name,
    requestedSourceSha: process.env.GITHUB_SHA, deployment: { id: active.id, versions: active.versions },
    bindings, routingVerification: {
      mode: 'external-authenticated-ui', expectedApex: expected.domain,
      note: 'Custom domains and zone routes require separate authenticated UI before/after evidence; this scoped token cannot manage them.',
    }, compatibilityDate: settings.compatibility_date,
    compatibilityFlags: settings.compatibility_flags,
  };
  await mkdir('release-evidence', { recursive: true });
  if (process.argv.includes('--after')) {
    // Retain resulting provider state even when a post-upload assertion fails.
    await writeFile('release-evidence/after.json', JSON.stringify(snapshot, null, 2) + '\n');
    const before = JSON.parse(await readFile('release-evidence/before.json', 'utf8'));
    assert.deepEqual(snapshot.bindings, before.bindings, 'Runtime binding names/types changed');
    assert.equal(snapshot.compatibilityDate, config.compatibility_date);
    assert.equal(active.versions.length, 1, 'Unexpected traffic split');
    assert.equal(active.versions[0].percentage, 100, 'New version does not serve all traffic');
    const version = await api(base + '/versions/' + encodeURIComponent(active.versions[0].version_id));
    assert.equal(version.annotations?.['workers/message'], `GitHub commit ${process.env.GITHUB_SHA}`, 'Published version does not identify this exact commit');
    snapshot.sourceCommit = process.env.GITHUB_SHA;
    await writeFile('release-evidence/after.json', JSON.stringify(snapshot, null, 2) + '\n');
  } else {
    await writeFile('release-evidence/before.json', JSON.stringify(snapshot, null, 2) + '\n');
  }
  // Only identifiers and binding names/types are recorded; no configuration or secret values.
  console.log(JSON.stringify(snapshot, null, 2));
}
main().catch(error => {
  console.error(token ? String(error.message).replaceAll(token, '[REDACTED]') : String(error.message));
  process.exitCode = 1;
});
