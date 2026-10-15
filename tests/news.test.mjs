import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Load the actual handler with only the framework response adapter replaced.
const source = (await readFile(new URL('../src/app/api/news/route.js', import.meta.url), 'utf8'))
  .replace('import { NextResponse } from "next/server";', 'const NextResponse = { json: (body, init) => Response.json(body, init) };');
const { GET } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const realFetch = globalThis.fetch;
const originalKey = process.env.NEWS_API_KEY;
test.afterEach(() => {
  globalThis.fetch = realFetch;
  if (originalKey === undefined) delete process.env.NEWS_API_KEY;
  else process.env.NEWS_API_KEY = originalKey;
});
const article = { title: 'Source headline', source: { name: 'Publisher' }, url: 'https://example.com/article', publishedAt: '2022-10-05T16:00:00Z', description: 'Source description', urlToImage: null };
function mockResponse(body, ok = true) {
  process.env.NEWS_API_KEY = 'test-only';
  globalThis.fetch = async () => ({ ok, json: async () => body });
}
test('missing key returns no invented articles and makes no request', async () => {
  delete process.env.NEWS_API_KEY;
  globalThis.fetch = () => assert.fail('must not fetch');
  assert.deepEqual(await (await GET()).json(), { articles: [], status: 'unavailable' });
});
for (const failure of ['network', 'http', 'json', 'provider', 'malformed']) {
  test(`${failure} failure returns unavailable without fabricated news`, async () => {
    mockResponse(failure === 'provider' ? { status: 'error' } : {} , failure !== 'http');
    if (failure === 'network') globalThis.fetch = async () => { throw new Error('offline'); };
    if (failure === 'json') globalThis.fetch = async () => ({ ok: true, json: async () => { throw new Error('invalid json'); } });
    assert.deepEqual(await (await GET()).json(), { articles: [], status: 'unavailable' });
  });
}
test('successful empty results remain empty', async () => {
  mockResponse({ status: 'ok', articles: [] });
  assert.deepEqual(await (await GET()).json(), { articles: [], status: 'empty' });
});
test('real article retains exact source link and publication date', async () => {
  mockResponse({ status: 'ok', articles: [article] });
  const response = await GET();
  assert.deepEqual(await response.json(), { articles: [article], status: 'ok' });
  assert.match(response.headers.get('cache-control'), /s-maxage=900/);
});
test('unusable links and missing or invalid dates cannot become recent news', async () => {
  mockResponse({ status: 'ok', articles: [
    ...['#', 'javascript:alert(1)', '/relative'].map(url => ({ ...article, url })),
    ...[undefined, null, '', 'not a date'].map(publishedAt => ({ ...article, publishedAt })),
    null, { ...article, title: '' }, article,
  ] });
  assert.deepEqual(await (await GET()).json(), { articles: [article], status: 'ok' });
});
test('all invalid source results produce an honest empty state', async () => {
  mockResponse({ status: 'ok', articles: [{ ...article, url: '#' }] });
  assert.deepEqual(await (await GET()).json(), { articles: [], status: 'empty' });
});
test('news UI exposes source dates and distinct unavailable and empty messages', async () => {
  const ui = await readFile(new URL('../src/components/NewsFeed.jsx', import.meta.url), 'utf8');
  assert.match(ui, /href=\{article.url\}/);
  assert.match(ui, /<time dateTime=\{article.publishedAt\}>/);
  assert.match(ui, /year: "numeric"/);
  assert.match(ui, /News is temporarily unavailable/);
  assert.match(ui, /No news articles are available right now/);
  assert.match(ui, /if \(!res.ok\)/);
  assert.doesNotMatch(ui, /timeAgo/);
});
test('homepage canonical and both social metadata fields reference original artwork', async () => {
  const home = await readFile(new URL('../src/app/page.jsx', import.meta.url), 'utf8');
  const layout = await readFile(new URL('../src/app/layout.jsx', import.meta.url), 'utf8');
  const card = await readFile(new URL('../src/app/social-card/route.jsx', import.meta.url), 'utf8');
  assert.match(home, /alternates: \{ canonical: "https:\/\/aaronjudge.net\/" \}/);
  assert.equal((layout.match(/"\/social-card"/g) || []).length, 2);
  assert.match(card, /UNOFFICIAL FAN SITE/);
  assert.match(card, /width: 1200, height: 630/);
});

test('optional images retain web URLs and discard malformed or unsafe URLs', async () => {
  const values = ['https://example.com/photo.jpg', 'http://example.com/photo.jpg', '#', '/relative', 'javascript:alert(1)', 'data:image/png;base64,AAAA', {}, [], 42, null];
  mockResponse({ status: 'ok', articles: values.map(urlToImage => ({ ...article, urlToImage })) });
  const data = await (await GET()).json();
  assert.deepEqual(data.articles.map(item => item.urlToImage), [values[0], values[1], ...values.slice(2).map(() => null)]);
});
