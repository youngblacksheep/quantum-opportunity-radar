// Shared presentation/API normalization. Original titles and source links are retained.
function cleanOpportunitySummary(value){
 let t=String(value||'').replace(/<(script|style|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/\s+/g,' ').trim();
 if(/^(?:设为首页|当前位置|首页\s*>)/.test(t)){
  const start=t.search(/各(?:有关|相关|申报|项目承担)单位[：:]/);
  if(start<0)return '';t=t.slice(start);
 }
 return t.split(/function\s+pagestat\s*\(|Produced By CMS|(?:©\s*)?版权所有|京ICP备|京公网安备|关闭\s*中央网络安全|【打印】|【关闭】|政策性文件留言咨询|#div_div\s*\{|\/\*分享\*\/|const\s+token\s*=|\$\(function\s*\(|分享[：:]|您访问的链接即将离开/)[0].trim();
}
function inferDeadline(value){
 const t=String(value||'').replace(/\s+/g,'');
 const dates=[];
 for(const m of t.matchAll(/(于|截止(?:时间)?[为：:]?)(20\d{2})年(\d{1,2})月(\d{1,2})日(前|止)?/g)){
  const tail=t.slice(m.index+m[0].length).split(/[。；！？，,]/)[0].slice(0,60);
  if(/^(?:\d|上午|下午|中午)/.test(tail))return null;
  if(!/(提交|报送|申报|申请|受理)/.test(tail)||/(共|已经|已受理|累计)/.test(tail))continue;
  if(m[1]==='于'&&m[5]!=='前')continue;
  const d=`${m[2]}-${m[3].padStart(2,'0')}-${m[4].padStart(2,'0')}`;
  const parsed=new Date(d);if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==d)return null;
  dates.push(d);
 }
 return new Set(dates).size===1?dates[0]:null;
}
function normalizeOpportunity(item){
 const inferred=item.deadlineAt?null:inferDeadline(item.summary);
 return {...item,displayTitle:String(item.projectName||'').replace(/[\u200b-\u200d\ufeff]/g,'').replace(/_(?:项目申报|通知公告|科技动态|政策文件)(?:_.*)?$/,''),summary:cleanOpportunitySummary(item.summary),deadlineAt:item.deadlineAt||inferred||null,...(inferred?{deadlineEvidence:'正文明确申报日期'}:{})};
}
function opportunityGroupKey(item){
 const t=String(item.projectName||'').replace(/\s|[\u200b-\u200d\ufeff]/g,'');
 const m=t.match(/国家重点研发计划[“「"]([^”」"]+)[”」"]重点专项(20\d{2})年度/);
 if(!m)return `record:${item.id||item.sourceUrl||t}`;
 const batch=t.match(/第([一二三四五六七八九十\d]+)批/);
 if(!batch)return `record:${item.id||item.sourceUrl||t}`;
 // Missing batch cannot safely be assumed to mean the first batch.
 return `${m[1]}:${m[2]}:${batch?.[1]||'未注明批次'}:${/征求意见/.test(t)?'consultation':'application'}`;
}
function groupOpportunities(items){
 const titleOf=item=>String(item.displayTitle||item.projectName||'').normalize('NFKC').replace(/\s|[\u200b-\u200d\ufeff]/g,'');
 const originals=new Map();
 for(const item of items){
  const title=titleOf(item);if(/转发/.test(title))continue;
  if(!originals.has(title))originals.set(title,[]);originals.get(title).push(item);
 }
 const targets=new Map();
 for(const item of items){
  const match=titleOf(item).match(/^(?:关于)?转发《(.+)》的通知$/);
  const candidates=match&&originals.get(match[1]);
  if(candidates?.length===1)targets.set(item,candidates[0]);
 }
 const groups=new Map();
 for(const item of items){const key=opportunityGroupKey(targets.get(item)||item);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item)}
 return [...groups.values()].map(group=>{
  const primary=group.find(item=>group.some(other=>targets.get(other)===item));
  return primary?[primary,...group.filter(item=>item!==primary)]:group;
 });
}
globalThis.QRadarQuality={cleanOpportunitySummary,inferDeadline,normalizeOpportunity,opportunityGroupKey,groupOpportunities};
