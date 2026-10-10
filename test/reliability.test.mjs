import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=html.match(/<script>\s*(?:function cleanSummary|const state=)[\s\S]*?<\/script>/)[0].replace(/^<script>|<\/script>$/g,'').replace(/\nload\(\);/,'');
function page(feeds={}){
 const nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',innerHTML:'',disabled:false,hidden:false,options:[],addEventListener(){},insertAdjacentHTML(){},classList:{toggle(){},add(){},remove(){}}});return nodes.get(id)};
 const ctx=vm.createContext({document:{querySelector:node,querySelectorAll:()=>[]},URL,URLSearchParams,Intl,Date,AbortController,setTimeout,clearTimeout,console:{error(){}},location:{href:'https://example.com/?q=量子&stage=open#opportunities',search:'?q=量子&stage=open'},history:{replaceState(){}},navigator:{},fetch:async path=>{const feed=feeds[path];return {ok:!!feed,json:async()=>feed}}});
 vm.runInContext(script,ctx);
 return {run:code=>vm.runInContext(code,ctx),node};
}
test('expired opportunities do not count as open in hero statistics',()=>{
 const p=page();p.run(`state.opportunities=[{stage:'open',deadlineAt:'2000-01-01T00:00:00Z'},{stage:'open',deadlineAt:'2099-01-01T00:00:00Z'}];renderStats()`);
 assert.equal(String(p.node('#hero-open').textContent),'1');
});
test('date-only deadlines remain open until end of the day in China',()=>{
 const p=page();assert.equal(p.run(`deadlineTimestamp('2026-10-04')`),Date.parse('2026-10-04T23:59:59.999+08:00'));
});
test('opportunities remain usable when all optional snapshots fail',async()=>{
 const p=page({'data/opportunities.json':{items:[{projectName:'量子测试',stage:'open',topicTags:[]}],lastSuccessfulSyncAt:'2000-01-01T00:00:00Z'}});
 await p.run('load()');assert.match(p.node('#result-count').textContent,/1 条/);assert.match(p.node('#team-grid').innerHTML,/读取失败/);assert.match(p.node('#failure-list').innerHTML,/读取失败/);assert.match(p.node('#data-health').textContent,/48 小时/);
});
test('malformed opportunity envelope is an error, not an empty result',async()=>{
 const p=page({'data/opportunities.json':{items:'bad'}});await p.run('load()');assert.match(p.node('#result-count').textContent,/读取失败/);assert.equal(p.node('#retry-load').hidden,false);
});
test('deadline sorting puts missing deadlines last within the same stage',()=>{
 const p=page();p.node('#sort').value='deadline';
 assert.equal(p.run(`sortOpportunities([{projectName:'unknown',stage:'open'},{projectName:'late',stage:'open',deadlineAt:'2099-02-01'},{projectName:'early',stage:'open',deadlineAt:'2099-01-01'}]).map(x=>x.projectName).join(',')`),'early,late,unknown');
});
test('missing coverage never claims there were no collection errors',()=>{
 const p=page();p.run('renderCoverage()');assert.doesNotMatch(p.node('#failure-list').innerHTML,/没有记录到/);
});
test('seed data and unknown sync time are visibly disclosed',async()=>{
 const p=page({'data/opportunities.json':{items:[],dataMode:'seed_fallback'}});await p.run('load()');assert.match(p.node('#data-health').textContent,/种子或回退/);assert.match(p.node('#last-sync').textContent,/尚无成功同步/);
});
test('metadata generation time cannot masquerade as successful collection',async()=>{
 const p=page({'data/opportunities.json':{items:[]},'data/metadata.json':{generatedAt:'2099-01-01'}});await p.run('load()');assert.match(p.node('#last-sync').textContent,/尚无成功同步/);
});
test('URL restores search text and share falls back safely without clipboard',async()=>{
 const p=page();p.run('restoreFilters()');assert.equal(p.node('#q').value,'量子');await p.run('shareFilters()');assert.match(p.node('#export-status').textContent,/地址栏/);
});
test('malformed team data does not prevent opportunity display',async()=>{
 const p=page({'data/opportunities.json':{items:[]},'data/approved-teams.json':{items:[null]}});await p.run('load()');assert.match(p.node('#result-count').textContent,/0 条/);assert.match(p.node('#team-grid').innerHTML,/读取失败/);
});
test('changing filters after a failed load keeps the error instead of showing zero results',async()=>{
 const p=page();await p.run('load()');p.run('renderOpportunities()');assert.match(p.node('#result-count').textContent,/读取失败/);
});
test('date-only deadlines never invent an 08:00 cutoff in cards or exports',()=>{
 const p=page();assert.equal(p.run(`fmtDate('2026-10-04',true)`),'2026-10-04（未注明具体时间）');assert.equal(p.run(`deadlineText({deadlineAt:'2026-10-04'})`),'截止 2026-10-04（未注明具体时间）');
});
test('card summaries exclude page chrome and code and stay compact',()=>{
 const p=page();const result=p.run(`compactSummary('现开展量子计算项目申报。'+'申报说明。'.repeat(100)+'关闭 中央网络安全和信息化委员会办公室 © 版权所有 function pagestat(){ secret }')`);
 assert.ok(result.length<=181);assert.doesNotMatch(result,/版权所有|pagestat|secret/);
 assert.equal(p.run(`compactSummary('量子项目申报通知。 版权所有 联系我们 function pagestat(){}')`),'量子项目申报通知。');
});

test('legacy navigation and inline scripts never replace the notice summary',()=>{
 const p=page();assert.equal(p.run(`compactSummary('首页 > 政策 [有效性]有效 for(var i=0;i<3;i++){} 各相关单位：现征集量子技术。 #div_div {color:red}')`),'各相关单位：现征集量子技术。');
 assert.match(p.run(`compactSummary('首页 > 政策 .share {color:red;} truncated')`),/摘要待更新/);
});

test('CAC header print controls do not hide the actual article',()=>{const p=page();assert.equal(p.run(`compactSummary('设为首页加入收藏 当前位置：首页 【打印】【纠错】 标题各有关单位：征集委员通知。 关闭 中央网络安全和信息化委员会办公室 版权所有')`),'各有关单位：征集委员通知。');});
