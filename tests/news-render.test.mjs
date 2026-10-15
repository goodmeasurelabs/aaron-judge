import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const require = createRequire(import.meta.url);
const { transform } = require('next/dist/build/swc');
const source = (await readFile(new URL('../src/components/NewsFeed.jsx', import.meta.url), 'utf8')).replace(/^import .*;\n/gm, '');
const { code } = await transform(source, { filename: 'NewsFeed.jsx', jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'classic' } } }, module: { type: 'commonjs' } });
function render(articles, status) {
  const values = [articles, false, status];
  const exports = {};
  new Function('exports', 'React', 'useState', 'useEffect', 'trackOutboundClick', code)(exports, React, () => [values.shift(), () => {}], () => {}, () => {});
  return renderToStaticMarkup(React.createElement(exports.default));
}
test('unavailable and empty results render honest status text with no article links', () => {
  for (const [status, message] of [['unavailable', 'News is temporarily unavailable'], ['empty', 'No news articles are available right now']]) {
    const html = render([], status);
    assert.ok(html.includes(message));
    assert.ok(html.includes('role="status"'));
    assert.doesNotMatch(html, /<a\b|<article\b/);
  }
});
test('article renders its original dated link, including publication year', () => {
  const html = render([{ title: 'Source headline', url: 'https://example.com/real-story', source: { name: 'Publisher' }, publishedAt: '2022-10-05T16:00:00Z' }], 'ok');
  assert.match(html, /href="https:\/\/example.com\/real-story"/);
  assert.match(html, /<time dateTime="2022-10-05T16:00:00Z">Oct 5, 2022<\/time>/);
  assert.ok(html.includes('Source headline'));
  assert.ok(html.includes('Publisher'));
});

// Exercise the real API normalization and real component together so a malformed
// optional field cannot hide otherwise usable articles in a mixed source feed.
test('mixed feed normalizes optional values and renders genuine articles without crashing', async () => {
  const handlerSource = (await readFile(new URL('../src/app/api/news/route.js', import.meta.url), 'utf8'))
    .replace('import { NextResponse } from "next/server";', 'const NextResponse = { json: (body, init) => Response.json(body, init) };');
  const { GET } = await import(`data:text/javascript;base64,${Buffer.from(handlerSource).toString('base64')}`);
  const realFetch = globalThis.fetch;
  const originalKey = process.env.NEWS_API_KEY;
  const genuine = { title: 'Genuine source headline', url: 'https://example.com/genuine', publishedAt: '2022-10-05T16:00:00Z', source: { name: 'Real publisher' }, description: 'Original source description', urlToImage: null };
  const malformed = [ {}, [], 42, true, null ];
  const inputs = malformed.map((value, i) => ({ ...genuine, title: `Malformed optional fields ${i}`, url: `https://example.com/story-${i}`, source: { name: value }, description: value, urlToImage: value }));
  inputs.push({ ...genuine, title: 'Missing optional fields', source: null, description: undefined, urlToImage: undefined });
  try {
    process.env.NEWS_API_KEY = 'test-only';
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ status: 'ok', articles: [genuine, ...inputs] }) });
    const data = await (await GET()).json();
    assert.equal(data.status, 'ok');
    assert.deepEqual(data.articles[0], genuine);
    assert.equal(data.articles.length, inputs.length + 1);
    for (const article of data.articles.slice(1)) {
      assert.deepEqual(article.source, { name: null });
      assert.equal(article.description, null);
      assert.equal(article.urlToImage, null);
    }
    const html = render(data.articles, data.status);
    assert.equal((html.match(/<article /g) || []).length, inputs.length + 1);
    assert.ok(html.includes('Genuine source headline'));
    assert.ok(html.includes('Real publisher'));
    assert.ok(html.includes('Original source description'));
    assert.match(html, /href="https:\/\/example.com\/genuine"/);
    assert.match(html, /<time dateTime="2022-10-05T16:00:00Z">Oct 5, 2022<\/time>/);
    assert.doesNotMatch(html, /\[object Object\]/);
  } finally {
    globalThis.fetch = realFetch;
    if (originalKey === undefined) delete process.env.NEWS_API_KEY;
    else process.env.NEWS_API_KEY = originalKey;
  }
});

test('client effect fetches the API and transitions from loading to sanitized mixed news', { timeout: 5000 }, async () => {
  const handlerSource = (await readFile(new URL('../src/app/api/news/route.js', import.meta.url), 'utf8'))
    .replace('import { NextResponse } from "next/server";', 'const NextResponse = { json: (body, init) => Response.json(body, init) };');
  const { GET } = await import(`data:text/javascript;base64,${Buffer.from(handlerSource).toString('base64')}`);
  const realFetch = globalThis.fetch;
  const originalKey = process.env.NEWS_API_KEY;
  const states = [];
  const effects = [];
  let cursor = 0;
  let initialized = false;
  let finished;
  const complete = new Promise(resolve => { finished = resolve; });
  const exports = {};
  new Function('exports', 'React', 'useState', 'useEffect', 'trackOutboundClick', code)(exports, React,
    initial => {
      const index = cursor++;
      if (!initialized) states[index] = initial;
      return [states[index], value => { states[index] = value; if (index === 1 && value === false) finished(); }];
    }, effect => { if (!initialized) effects.push(effect); }, () => {});
  const renderCurrent = () => { cursor = 0; return renderToStaticMarkup(React.createElement(exports.default)); };
  const base = { title: 'Verified headline', url: 'https://example.com/verified', publishedAt: '2022-10-05T16:00:00Z', source: { name: 'Publisher' }, description: 'Source text', urlToImage: 'https://example.com/image.jpg' };
  const requests = [];
  try {
    process.env.NEWS_API_KEY = 'test-only';
    globalThis.fetch = async url => {
      requests.push(url);
      if (url === '/api/news') return GET();
      assert.ok(url.startsWith('https://newsapi.org/'));
      return { ok: true, json: async () => ({ status: 'ok', articles: [base, { ...base, title: 'Malformed fields', source: { name: {} }, description: {}, urlToImage: 'javascript:alert(1)' }] }) };
    };
    assert.match(renderCurrent(), /animate-pulse/);
    initialized = true;
    for (const effect of effects) effect();
    await complete;
    const html = renderCurrent();
    assert.equal(requests[0], '/api/news');
    assert.equal(requests.length, 2);
    assert.ok(html.includes('Verified headline'));
    assert.ok(html.includes('Malformed fields'));
    assert.ok(html.includes('https://example.com/image.jpg'));
    assert.equal((html.match(/<img /g) || []).length, 1);
    assert.doesNotMatch(html, /animate-pulse|javascript:|\[object Object\]/);
  } finally {
    globalThis.fetch = realFetch;
    if (originalKey === undefined) delete process.env.NEWS_API_KEY;
    else process.env.NEWS_API_KEY = originalKey;
  }
});
