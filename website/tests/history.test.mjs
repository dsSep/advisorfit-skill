import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

mkdirSync('outputs', {recursive:true});
const transpile=source=>ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const report=resolve('outputs/history-report-test.mjs');
writeFileSync(report,transpile(readFileSync('app/components/report.tsx','utf8')));
const cases=JSON.parse(readFileSync('lib/historical-cases.json','utf8'));
const source=readFileSync('app/components/history.tsx','utf8')
  .replace('import cases from "../../lib/historical-cases.json";',`const cases=${JSON.stringify(cases)};`)
  .replace('"./report"',JSON.stringify(pathToFileURL(report).href));
const target=resolve('outputs/history-component-test.mjs');writeFileSync(target,transpile(source));
const { History,DownloadSkill }=await import(pathToFileURL(target).href);

test('historical comparison exposes both full answers, versions, limitations and original-record navigation',()=>{
  const html=renderToStaticMarkup(React.createElement(History));
  assert.match(html,/历史回放/);assert.match(html,/无Skill · 完整回答/);assert.match(html,/AdvisorFit 0.2.5 · 完整回答/);
  assert.match(html,/gpt-6-t-mini/);assert.match(html,/还不能认定为高度匹配/);assert.match(html,/N.l老师与你的研究方向及导师适配度分析/);
  assert.match(html,/aria-pressed="true"/);assert.match(html,/examples\/case-001/);
  assert.doesNotMatch(html,/<script|href="javascript:/i);
});

test('download offers the actual versioned artifact and both supported-host instructions',()=>{
  const html=renderToStaticMarkup(React.createElement(DownloadSkill));
  assert.match(html,/releases\/download\/v0.2.8\/advisorfit-skill-0.2.8.zip/);
  assert.match(html,/installation.md#chatgpt/);assert.match(html,/installation.md#codex/);
  assert.match(html,/自行核对/);
});
