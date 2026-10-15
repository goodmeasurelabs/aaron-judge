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
