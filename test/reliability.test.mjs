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
 vm.runInContext(readFileSync(new URL('../quality.js',import.meta.url),'utf8'),ctx);
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
test('team status distinguishes configured sources from actual completed checks',()=>{const p=page();p.run(`state.teamStatus={configuredSources:4,checkedSources:0,lastCheckedAt:null,pendingReviewCount:2,verifiedCount:0};renderTeams()`);assert.match(p.node('#team-health').textContent,/尚未/);assert.match(p.node('#team-health').textContent,/2/);});
test('missing team status never borrows the opportunity sync timestamp',()=>{const p=page();p.run('renderTeams()');assert.match(p.node('#team-health').textContent,/未知/)});
test('per-source status distinguishes failures, unvisited sources and no extracted records',()=>{const p=page();p.run(`state.teamStatus={configuredSources:3,checkedSources:2,verifiedCount:0,pendingReviewCount:0,sources:[{authority:'甲大学',status:'failure',error:'timeout'},{authority:'乙大学',status:'not_checked'},{authority:'丙大学',status:'success',publishedCount:0,reviewCount:0}]};renderTeams()`);const html=p.node('#team-source-status').innerHTML;assert.match(html,/抓取失败/);assert.match(html,/尚未巡检/);assert.match(html,/本轮未提取到/)});
test('pagination limits visible groups while export filtering retains every record',()=>{
 const p=page();p.run(`state.opportunitiesAvailable=true;state.opportunities=Array.from({length:25},(_,i)=>({id:'r'+i,projectName:'通知'+i,stage:'open',sourceUrl:'https://example.com/'+i}));renderOpportunities()`);
 assert.equal((p.node('#opportunity-list').innerHTML.match(/<article /g)||[]).length,12);
 assert.equal(p.run('getFilteredOpportunities().length'),25);
 p.run('state.page=3;renderOpportunities()');assert.equal((p.node('#opportunity-list').innerHTML.match(/<article /g)||[]).length,1);
 p.node('#q').value='无匹配';p.run('renderOpportunities()');assert.equal(p.node('#pagination').innerHTML,'');
});

test('deadline alerts respect China calendar, exact cutoff, and unknown dates',()=>{
 const p=page();const now='2026-10-25T10:00:00+08:00';
 const alert=(item)=>p.run(`deadlineAlert(${JSON.stringify(item)},Date.parse('${now}'))`);
 assert.equal(alert({stage:'open',deadlineAt:'2026-10-25'}),'今日截止');
 assert.equal(alert({stage:'open',deadlineAt:'2026-10-26T00:00:00+08:00'}),'明日截止');
 assert.equal(alert({stage:'open',deadlineAt:'2026-10-29T23:59:00+08:00'}),'4 天后截止');
 for(const item of [{stage:'open'},{stage:'open',deadlineAt:'invalid'},{stage:'open',deadlineAt:'2026-10-25T09:00:00+08:00'},{stage:'closed',deadlineAt:'2026-10-26'},{stage:'upcoming',deadlineAt:'2026-10-26'},{stage:'open',deadlineAt:'2026-11-20'}])assert.equal(alert(item),'');
});
test('closing filter includes only open records with a cutoff in the next seven days',()=>{
 const p=page();p.node('#stage').value='closing';
 assert.equal(p.run(`state.opportunities=[{id:'soon',stage:'open',deadlineAt:new Date(Date.now()+86400000).toISOString()},{id:'late',stage:'open',deadlineAt:new Date(Date.now()+10*86400000).toISOString()},{id:'unknown',stage:'open'},{id:'past',stage:'open',deadlineAt:'2000-01-01'}];getFilteredOpportunities().map(x=>x.id).join(',')`),'soon');
});

test('search matches separate keywords across fields with full-width normalization',()=>{
 const p=page();p.run(`state.opportunities=[{id:'match',projectName:'量子计算 AI 项目',province:'广东',stage:'open',topicTags:[]},{id:'other',projectName:'量子计算',province:'北京',stage:'open',topicTags:[]}];`);
 p.node('#q').value=' 量子　广东  ａｉ ';
 assert.equal(p.run(`getFilteredOpportunities().map(x=>x.id).join(',')`),'match');
 p.node('#q').value='量子 不存在';assert.equal(p.run('getFilteredOpportunities().length'),0);
 p.node('#q').value='　 ';assert.equal(p.run('getFilteredOpportunities().length'),2);
});
test('empty filters offer recovery while a genuinely empty feed is distinguished',()=>{
 const p=page();p.run(`state.opportunitiesAvailable=true;state.opportunities=[{projectName:'量子计算',stage:'open'}]`);p.node('#q').value='不存在';p.run('renderOpportunities()');
 assert.match(p.node('#opportunity-list').innerHTML,/清除筛选/);assert.match(p.node('#opportunity-list').innerHTML,/减少关键词/);
 p.run(`state.opportunities=[];renderOpportunities()`);assert.match(p.node('#opportunity-list').innerHTML,/暂无已收录/);assert.doesNotMatch(p.node('#opportunity-list').innerHTML,/清除筛选/);
});
