(() => {
  const activeSources = [
    {level:'国家级',region:'全国',authority:'国家科技管理信息系统公共服务平台',url:'https://service.most.gov.cn/kjjh_tztg_all/'},
    {level:'国家级',region:'全国',authority:'国家自然科学基金委员会',url:'https://www.nsfc.gov.cn/p1/3381/2824/zntg.html'},
    {level:'国家级',region:'全国',authority:'国家发展和改革委员会',url:'https://www.ndrc.gov.cn/xwdt/tzgg/'},
    {level:'国家级',region:'全国',authority:'工业和信息化部',url:'https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/index.html'},
    {level:'国家级',region:'全国',authority:'中央网络安全和信息化委员会办公室',url:'https://www.cac.gov.cn/hdfw/wxan/A093802index_1.htm'},
    {level:'国家级',region:'全国',authority:'国家数据局',url:'https://www.nda.gov.cn/sjj/zwgk/tzgg/list/index_pc_1.html'},
    {level:'国家级',region:'全国',authority:'国家密码管理局',url:'https://www.oscca.gov.cn/sca/xwdt/tzgg.shtml'},
    {level:'省级',region:'北京',authority:'北京市科学技术委员会、中关村科技园区管理委员会',url:'https://kw.beijing.gov.cn/zwgk/tzgg/'},
    {level:'省级',region:'天津',authority:'天津市科学技术局',url:'https://kxjs.tj.gov.cn/BSFW9672/XMGL4742/XMSB4597/'},
    {level:'省级',region:'内蒙古',authority:'内蒙古自治区科学技术厅',url:'https://kjt.nmg.gov.cn/slb/kjdt/tzgg/index_1.html'},
    {level:'省级',region:'辽宁',authority:'辽宁省科学技术厅',url:'https://kjt.ln.gov.cn/kjt/tztg/gztz/index.shtml'},
    {level:'省级',region:'吉林',authority:'吉林省科学技术厅',url:'https://kjt.jl.gov.cn/xwzx/tztg/index.html'},
    {level:'省级',region:'黑龙江',authority:'黑龙江省科学技术厅',url:'https://kjt.hlj.gov.cn/kjt/c113904/redirect_firstChannel.shtml'},
    {level:'省级',region:'上海',authority:'上海市科学技术委员会',url:'https://stcsm.sh.gov.cn/zwgk/kyjhxm/xmsb/'},
    {level:'省级',region:'江苏',authority:'江苏省科学技术厅',url:'https://kxjst.jiangsu.gov.cn/col/col82540/index.html'},
    {level:'省级',region:'浙江',authority:'浙江省科学技术厅',url:'https://kjt.zj.gov.cn/col/col1229225203/index.html'},
    {level:'省级',region:'福建',authority:'福建省科学技术厅',url:'https://kjt.fujian.gov.cn/xxgk/tzgg/'},
    {level:'省级',region:'山东',authority:'山东省科学技术厅',url:'https://kjt.shandong.gov.cn/col/col13360/index.html'},
    {level:'省级',region:'湖北',authority:'湖北省科学技术厅',url:'https://kjt.hubei.gov.cn/kjdt/tzgg/'},
    {level:'省级',region:'湖南',authority:'湖南省科学技术厅',url:'https://kjt.hunan.gov.cn/kjt/xmxx/xmsb/index.html'},
    {level:'省级',region:'广东',authority:'广东省科学技术厅',url:'https://gdstc.gd.gov.cn/zwgk_n/tzgg/'},
    {level:'省级',region:'重庆',authority:'重庆市科学技术局',url:'https://kjj.cq.gov.cn/zwxx_176/tzgg/'},
    {level:'省级',region:'贵州',authority:'贵州省科学技术厅',url:'https://kjt.guizhou.gov.cn/wsfw/ggfw/xmsb/'},
    {level:'省级',region:'云南',authority:'云南省科学技术厅',url:'https://kjt.yn.gov.cn/xwdt/tzgg/'},
    {level:'省级',region:'西藏',authority:'西藏自治区科学技术厅',url:'https://sti.xizang.gov.cn/xxgk/fdzdgk/tzgg/'},
    {level:'省级',region:'宁夏',authority:'宁夏回族自治区科学技术厅',url:'https://kjt.nx.gov.cn/wap/xxdt/tzgg/'},
    {level:'省级',region:'新疆',authority:'新疆维吾尔自治区科学技术厅',url:'https://kjt.xinjiang.gov.cn/kjt/c100264/common_list.shtml'},
    {level:'市级',region:'武汉',authority:'武汉市科技创新局',url:'https://kjj.wuhan.gov.cn/wmfw/tzgg/tzgg_18371/'},
    {level:'市级',region:'济南',authority:'济南市科学技术局',url:'https://jnsti.jinan.gov.cn/col/col13061/index.html'}
  ];

  const pendingSources = [
    {region:'河北',authority:'河北省科学技术厅',url:'https://kjt.hebei.gov.cn/'},
    {region:'山西',authority:'山西省科学技术厅',url:'https://kjt.shanxi.gov.cn/'},
    {region:'安徽',authority:'安徽省科学技术厅',url:'https://kjt.ah.gov.cn/'},
    {region:'江西',authority:'江西省科学技术厅',url:'https://kjt.jiangxi.gov.cn/'},
    {region:'河南',authority:'河南省科学技术厅',url:'https://kjt.henan.gov.cn/'},
    {region:'广西',authority:'广西壮族自治区科学技术厅',url:'https://kjt.gxzf.gov.cn/'},
    {region:'海南',authority:'海南省科学技术厅',url:'https://dost.hainan.gov.cn/'},
    {region:'四川',authority:'四川省科学技术厅',url:'https://kjt.sc.gov.cn/'},
    {region:'陕西',authority:'陕西省科学技术厅',url:'https://kjt.shaanxi.gov.cn/'},
    {region:'甘肃',authority:'甘肃省科学技术厅',url:'https://kjt.gansu.gov.cn/'},
    {region:'青海',authority:'青海省科学技术厅',url:'https://kjt.qinghai.gov.cn/'}
  ];

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const group = level => activeSources.filter(x => x.level === level);
  const rows = items => items.map(x => `<tr><td>${esc(x.level || '省级')}</td><td>${esc(x.region)}</td><td>${esc(x.authority)}</td><td><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">打开官方入口</a></td><td><span class="source-status source-status-active">已接入</span></td></tr>`).join('');
  const pendingRows = pendingSources.map(x => `<tr><td>省级</td><td>${esc(x.region)}</td><td>${esc(x.authority)}</td><td><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">官网首页</a></td><td><span class="source-status source-status-pending">待接入稳定列表</span></td></tr>`).join('');

  const style = document.createElement('style');
  style.textContent = `
    .source-overview{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}
    .source-overview .mini-stat{border:1px solid var(--line)}
    .source-groups{display:grid;gap:12px}
    .source-group{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden}
    .source-group summary{cursor:pointer;list-style:none;padding:16px 18px;font-size:14px;font-weight:700;display:flex;justify-content:space-between;gap:18px;align-items:center;background:#fafbfc}
    .source-group summary::-webkit-details-marker{display:none}
    .source-group summary span{color:var(--muted);font-size:12px;font-weight:500}
    .source-group table{min-width:760px}
    .source-status{display:inline-flex;align-items:center;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700;white-space:nowrap}
    .source-status-active{background:var(--green2);color:var(--green)}
    .source-status-pending{background:var(--amber2);color:var(--amber)}
    .source-footnote{margin-top:12px;color:var(--muted);font-size:12px}
    @media(max-width:900px){.source-overview{grid-template-columns:repeat(2,1fr)}}
  `;
  document.head.appendChild(style);

  const nav = document.querySelector('.nav');
  if (nav && !nav.querySelector('a[href="#sources"]')) {
    const methodology = nav.querySelector('a[href="#methodology"]');
    const link = document.createElement('a');
    link.href = '#sources';
    link.textContent = '监测网站';
    nav.insertBefore(link, methodology || null);
  }

  const methodology = document.querySelector('#methodology');
  if (!methodology || document.querySelector('#sources')) return;

  const section = document.createElement('section');
  section.id = 'sources';
  section.className = 'section';
  section.innerHTML = `
    <div class="section-head"><div><p class="section-kicker">Official Source Coverage</p><h2>官方监测网站</h2></div><div class="section-note">展示当前生产抓取配置及待完善覆盖范围</div></div>
    <div class="source-overview">
      <div class="mini-stat"><strong>${activeSources.length}</strong><span>活跃官方来源</span></div>
      <div class="mini-stat"><strong>${group('国家级').length}</strong><span>国家级来源</span></div>
      <div class="mini-stat"><strong>${group('省级').length}</strong><span>省级来源</span></div>
      <div class="mini-stat"><strong>${group('市级').length}</strong><span>重点城市来源</span></div>
    </div>
    <div class="source-groups">
      <details class="source-group" open><summary>国家级监测入口 <span>${group('国家级').length} 个</span></summary><div class="table-wrap"><table><thead><tr><th>层级</th><th>地区</th><th>主管单位</th><th>监测入口</th><th>状态</th></tr></thead><tbody>${rows(group('国家级'))}</tbody></table></div></details>
      <details class="source-group" open><summary>省级监测入口 <span>${group('省级').length} 个</span></summary><div class="table-wrap"><table><thead><tr><th>层级</th><th>地区</th><th>主管单位</th><th>监测入口</th><th>状态</th></tr></thead><tbody>${rows(group('省级'))}</tbody></table></div></details>
      <details class="source-group"><summary>重点城市监测入口 <span>${group('市级').length} 个</span></summary><div class="table-wrap"><table><thead><tr><th>层级</th><th>地区</th><th>主管单位</th><th>监测入口</th><th>状态</th></tr></thead><tbody>${rows(group('市级'))}</tbody></table></div></details>
      <details class="source-group"><summary>待完善省级覆盖 <span>${pendingSources.length} 个</span></summary><div class="table-wrap"><table><thead><tr><th>层级</th><th>地区</th><th>主管单位</th><th>官网入口</th><th>状态</th></tr></thead><tbody>${pendingRows}</tbody></table></div></details>
    </div>
    <p class="source-footnote">“已接入”表示当前已有明确监测入口并参与自动巡检；“待接入稳定列表”表示已确定主管部门官网，但仍需完成可持续抓取的通知公告或项目申报列表定位。官网访问限制、robots 规则及页面结构变化可能影响单次抓取。</p>
  `;
  methodology.parentNode.insertBefore(section, methodology);
})();
(() => {
  function removeOldCoverage(){
  const coverage=document.querySelector('#coverage');
  if(coverage){
    coverage.style.display='none';
  }
  document.querySelector('.nav a[href="#coverage"]')?.remove();
}

  function trimSummaries(root=document){
    root.querySelectorAll?.('.summary').forEach(el=>{
      const text=(el.textContent||'').trim();
      if(text.length>220){
        el.textContent=text.slice(0,220)+'…';
      }
    });
  }

  removeOldCoverage();
  trimSummaries();

  const host=document.querySelector('#opportunity-list');
  if(host){
    new MutationObserver(()=>{
      trimSummaries(host);
    }).observe(host,{
      childList:true,
      subtree:true
    });
  }
})();
