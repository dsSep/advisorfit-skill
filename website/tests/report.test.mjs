import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const reportFile = 'app/components/report.tsx';
const source = existsSync(reportFile) ? readFileSync(reportFile, 'utf8') :
  'export ' + readFileSync('app/components/demo.tsx', 'utf8').split('function Report(')[1].split('export function Demo')[0].replace(/^/, 'function Report(');
mkdirSync('outputs', { recursive:true });
const target = resolve('outputs/report-test.mjs');
writeFileSync(target, ts.transpileModule(source, { compilerOptions:{ jsx:ts.JsxEmit.ReactJSX, module:ts.ModuleKind.ESNext, target:ts.ScriptTarget.ES2022 } }).outputText);
const { Report } = await import(pathToFileURL(target).href + '?test=' + Date.now());
const render = text => renderToStaticMarkup(React.createElement(Report, { text }));
test('the reported pipe table renders semantic headers and cells, retaining bold and escaped pipes', () => {
  const html = render('## 匹配依据与边界\n\n| 导师 | 依据 | 边界 |\n|---|---|---|\n| Z.s | Excel问卷 | **经验未知** |\n| L.s | A\\|B | 待确认 |');
  assert.match(html, /<table/); assert.match(html, /<th[^>]*>导师<\/th>/);
  assert.match(html, /<td[^>]*>Z.s<\/td>/); assert.match(html, /<strong>经验未知<\/strong>/);
  assert.match(html, /A\|B/); assert.match(html, /tabindex="0"/i);
});
test('model HTML and unsafe links do not become executable markup', () => {
  const html = render('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[坏链接](javascript:alert%281%29)\n\n[来源](https://example.org/paper)');
  assert.doesNotMatch(html, /<script|<img|href="javascript:/i);
  assert.match(html, /href="https:\/\/example.org\/paper"/);
});
test('incomplete streaming tables can render without crashing', () => {
  for (const text of ['| 导师 | 依据 |', '| 导师 | 依据 |\n|---|---|\n| Z.s | 尚未']) assert.equal(typeof render(text), 'string');
});
