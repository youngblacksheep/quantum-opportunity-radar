import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const ctx=vm.createContext({});
try{vm.runInContext(readFileSync(new URL('../quality.js',import.meta.url),'utf8'),ctx)}catch{}
const q=ctx.QRadarQuality;
test('deadline requires unique explicit submission context and valid date',()=>{
 assert.equal(q.inferDeadline('于2026年11月23日前将纸质版材料报送我局。'),'2026-11-23');
 assert.equal(q.inferDeadline('发布日期2026年10月9日。失效日期2026年11月23日。'),null);
 assert.equal(q.inferDeadline('于2026年11月23日前提交材料。于2026年11月20日前提交材料。'),null);
 assert.equal(q.inferDeadline('于2026年2月30日前提交材料。'),null);
 assert.equal(q.inferDeadline('于2026年11月23日17时前提交材料。'),null);
});
test('normalization preserves explicit deadline and strips website chrome',()=>{
 const r=q.normalizeOpportunity({projectName:'通知_项目申报_上海市科学技术委员会',deadlineAt:'2026-11-20',summary:'首页 > 政策文件 【字体：大中小】 打印 各相关单位：请于2026年11月23日前提交材料。 分享： X 相关政策'});
 assert.equal(r.deadlineAt,'2026-11-20');assert.equal(r.displayTitle,'通知');
 assert.equal(r.summary,'各相关单位：请于2026年11月23日前提交材料。');
});
test('grouping keeps years, batches and consultation separate',()=>{
 const title='国家重点研发计划“量子材料”重点专项2026年度（第一批）项目申报';
 const a={projectName:title}, b={projectName:'关于转发'+title+'的通知'};
 assert.equal(q.opportunityGroupKey(a),q.opportunityGroupKey(b));
 for(const t of [title.replace('第一批','第二批'),title.replace('2026','2025'),title.replace('项目申报','指南征求意见')])assert.notEqual(q.opportunityGroupKey(a),q.opportunityGroupKey({projectName:t}));
 assert.equal(q.groupOpportunities([{...a,id:'a'},{...b,id:'b'}]).length,1);
 assert.equal(q.groupOpportunities([{id:'x',projectName:'通知'},{id:'y',projectName:'通知'}]).length,2);
});

test('same-sentence deadlines and historical counts never create a guessed cutoff',()=>{
 assert.equal(q.inferDeadline('于2026年11月20日前提交预申报，于2026年11月23日前提交正式申报。'),null);
 assert.equal(q.inferDeadline('截至2026年11月23日，共受理申报项目20项。'),null);
});
test('missing batch information cannot merge notices',()=>{
 const projectName='国家重点研发计划“量子材料”重点专项2026年度项目申报通知';
 assert.equal(q.groupOpportunities([{id:'a',projectName},{id:'b',projectName}]).length,2);
});

test('explicit repost uses original as primary and retains local details',()=>{
 const title='关于组织申报国家网络空间安全国家科技重大专项第四批项目的通知（公开类）';
 const original={id:'national',projectName:title,deadlineAt:'2026-11-15'};
 const repost={id:'wuhan',projectName:`关于转发《${title}》的通知`,deadlineAt:'2026-11-12'};
 const groups=q.groupOpportunities([repost,original]);
 assert.equal(groups.length,1);assert.equal(groups[0][0].id,'national');
 assert.equal(groups[0][1].deadlineAt,'2026-11-12');
 assert.equal(q.groupOpportunities([repost])[0][0].id,'wuhan');
 assert.equal(q.groupOpportunities([repost,{...original,projectName:title.replace('第四批','第五批')}]).length,2);
 assert.equal(q.groupOpportunities([repost,original,{...original,id:'another'}]).length,3);
});
