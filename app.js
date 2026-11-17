const likelihood = [
  ['P11','桥梁总体技术状况',.18,[['A级 / 1类：全新状态、功能完好',2],['B级 / 2类：轻微损伤',4],['C级 / 3类：中等缺损',6],['D级 / 4类 / 不合格：严重影响使用',8],['E级 / 5类：危及安全',10]]],
  ['P12','桥梁特殊场景',.06,[['其他桥梁情形',0],['独柱墩桥、弯桥、坡桥、轻型少筋拱桥、带挂梁结构等',10]]],
  ['P13','桥梁服役年限',.10,[['5年以下',2],['6–10年',4],['11–20年',6],['21–30年',8],['30年以上',10]]],
  ['P14','加固改造情况',.08,[['0次',0],['1–2次',3],['3–4次',7],['4次以上',10]]],
  ['P15','作业或活动',.04,[['100m范围以外',3],['50m–100m范围内',7],['50m范围内',10]]],
  ['P16','养护类别',.08,[['V类养护',2],['IV类养护',4],['III类养护',6],['II类养护',8],['I类养护',10]]],
  ['P21','车船及漂流物撞击',.08,[['已设置防撞措施',2],['无碰撞记录且未设防撞措施',7],['存在车船及漂流物碰撞记录',10]]],
  ['P22','重载通行',.08,[['低于设计荷载或重载量小',3],['重载通行量一般',7],['大件运输规划或重载通行量大',10]]],
  ['P31','地震',.08,[['抗震设防烈度6度及以下',3],['抗震设防烈度7度',7],['抗震设防烈度8度及以上',10]]],
  ['P32','周边环境',.10,[['其他桥梁情形',0],['漫水、封河风险或极端气候冰冻地区',5],['地质灾害易发、历史水毁、河道变迁、采煤挖矿、温度显著变化',10]]],
  ['P41','日常巡查',.04,[['其他桥梁情形',0],['跨江河、高速、轨道等日常巡查不易到达桥下',10]]],
  ['P42','智慧监测设施',.04,[['已设置且运行未超过5年',0],['已设置且运行超过5年',5],['未设置智慧监测设施',10]]],
  ['P43','应急处置水平',.04,[['高：预案完善且定期培训演练',0],['中：预案完善但未定期培训演练',5],['低：未制定预案及现场处置方案',10]]]
];
const consequence = [
  ['C11','桥梁类型',.15,[['梁桥',3],['拱桥',5],['斜拉桥',6],['悬索桥',10],['组合桥梁',10]]],
  ['C12','多孔跨径总长、单孔跨径',.20,[['总长<8m，或单孔跨径<5m',0],['总长8–30m，或单孔跨径5–20m',4],['总长30–100m，或单孔跨径20–40m',6],['总长100–500m，或单孔跨径40–100m',8],['总长≥500m，或单孔跨径≥100m',10]]],
  ['C21','所在道路等级',.12,[['支路',2],['次干路',5],['主干路',7],['快速路',10]]],
  ['C31','交通繁忙程度',.10,[['低',2],['中',6],['高',10]]],
  ['C32','重点关注桥梁',.15,[['其他桥梁情形',0],['立交桥、高架桥、跨江河、设置大型广告或悬挂物',6],['跨高速、轨道、地铁穿越、跨通航河道',10]]],
  ['C41','文物科研价值',.08,[['无特殊社会文化价值、特定科研需求',0],['省级及以上文保或特定科研需求',10]]],
  ['C42','周边人口密度、工厂数量、分布等',.20,[['低',2],['中',6],['高',10]]]
];
const scoreValues = {};
const $ = id => document.getElementById(id);
function renderFields(items, target) {
  $(target).innerHTML = items.map(([id,name,weight,options]) => `<article class="score-field"><h3>${id} · ${name}<span class="weight">权重 ${weight}</span></h3><p>按附录表格选择与实际情况最相符的取值。</p><label>评估依据<select id="${id}">${options.map(([label,value])=>`<option value="${value}">${label}（${value}分）</option>`).join('')}</select></label></article>`).join('');
}
function level(score) { return score < 2 ? 1 : score < 4 ? 2 : score < 6 ? 3 : score < 8 ? 4 : 5; }
const riskMatrix = { '5-1':'III','5-2':'II','5-3':'II','5-4':'I','5-5':'I','4-1':'III','4-2':'III','4-3':'II','4-4':'II','4-5':'I','3-1':'IV','3-2':'III','3-3':'III','3-4':'II','3-5':'II','2-1':'IV','2-2':'IV','2-3':'III','2-4':'III','2-5':'II','1-1':'IV','1-2':'IV','1-3':'IV','1-4':'III','1-5':'III' };
const advice = {I:'应当立即采取维修、更新改造措施，直至风险降至可接受范围；确定主要风险源，开展全面监测，必要时实施应急监测。',II:'应采取维修、更新改造措施或加强管理，将风险降至一般水平及以下；确定主要风险源，开展全面或轻量化靶向监测。',III:'增加巡查频次；针对典型病害与损伤，宜开展轻量化靶向监测。',IV:'定期巡查维护；原则上无需开展智慧监测工作。位于重要通道或文保桥梁等特殊情形时，可开展轻量化靶向监测。'};
const riskText = {I:'重大',II:'较大',III:'一般',IV:'低'};
function selectedLabel(id) { const e=$(id); return e ? e.options[e.selectedIndex].text.replace(/（.*$/, '') : ''; }
function priority() {
  const years=Number($('serviceYears').value)||0, c=$('condition').value, m=$('maintenance').value, len=Number($('length').value)||0, span=Number($('span').value)||0;
  const reasons=[];
  if(years>30 && ['C','D','E'].includes(c)) reasons.push('服役年限超过30年且存在明显病害');
  if(c==='D' || c==='E' || ['I','II','III'].includes(m) && ['C','D','E'].includes(c)) reasons.push('技术状况或养护类别达到表 H.1 的重点情形');
  if(['斜拉桥','悬索桥','组合桥梁'].includes($('bridgeType').value)) reasons.push('属于需重点关注的特殊/复杂结构');
  if(len>1000 || span>60) reasons.push('桥长超过1000m或单跨超过60m');
  if($('trafficRole').value !== 'other') reasons.push('位于重要通道、繁忙或重载交通场景');
  if($('otherPriority').value !== 'none') reasons.push('存在选择的其他表 H.1 重点情形');
  const html = reasons.length ? `<strong>优先评估：是</strong><br>触发条件：${reasons.join('；')}。` : '<strong>优先评估：暂未触发</strong><br>当前录入资料未命中表 H.1 的明确筛查条件；仍可根据实际需要开展评估。';
  $('priorityResult').className = 'priority-result' + (reasons.length ? ' priority':''); $('priorityResult').innerHTML=html; return {reasons,html};
}
function score(items) { return items.reduce((sum,[id,,weight])=>sum+(Number($(id).value)||0)*weight,0); }
function renderMatrix(p,c) { let h='<div></div><div>后果 1</div><div>2</div><div>3</div><div>4</div><div>5</div>'; for(let pi=5;pi>=1;pi--){h+=`<div>可能 ${pi}</div>`; for(let ci=1;ci<=5;ci++){const r=riskMatrix[`${pi}-${ci}`];h+=`<div class="m-${r} ${pi===p&&ci===c?'selected':''}">${r}</div>`;}} $('matrix').innerHTML=h; }
function update() {
  const p=score(likelihood), c=score(consequence), pl=level(p), cl=level(c), risk=riskMatrix[`${pl}-${cl}`], pri=priority();
  $('pScore').textContent=p.toFixed(2); $('cScore').textContent=c.toFixed(2); $('pLevel').textContent=`等级 ${pl}`; $('cLevel').textContent=`等级 ${cl}`; $('riskLevel').textContent=risk; $('riskText').textContent=riskText[risk]; $('controlAdvice').textContent=advice[risk]; $('prioritySummary').innerHTML=pri.html; $('riskCard').className=`risk-${risk}`;
  renderMatrix(pl,cl);
  const all=[...likelihood,...consequence]; $('breakdown').innerHTML=all.map(([id,name,w])=>`<tr><td>${id} · ${name}</td><td>${selectedLabel(id)}</td><td>${w}</td><td>${((Number($(id).value)||0)*w).toFixed(2)}</td></tr>`).join('');
}
function syncBasics() {
  const map={A:2,B:4,C:6,D:8,E:10}; $('P11').value=map[$('condition').value];
  const y=Number($('serviceYears').value)||0; $('P13').value=y<=5?2:y<=10?4:y<=20?6:y<=30?8:10;
  const mm={V:2,IV:4,III:6,II:8,I:10}; $('P16').value=mm[$('maintenance').value];
  const type=$('bridgeType').value; $('C11').value=type==='梁桥'?3:type==='拱桥'?5:type==='斜拉桥'?6:10;
  const l=Number($('length').value)||0,s=Number($('span').value)||0; $('C12').value=(l>=500||s>=100)?10:(l>=100||s>=40)?8:(l>=30||s>=20)?6:(l>=8||s>=5)?4:0;
  const tr=$('trafficRole').value; $('P22').value=tr==='heavy'?10:tr==='main'?7:3; $('C21').value=tr==='heavy'?10:tr==='main'?7:2;
}
function loadExample() { $('bridgeName').value='附录示例桥梁'; $('bridgeType').value='梁桥'; $('condition').value='A'; $('serviceYears').value=17; $('maintenance').value='III'; $('length').value=366.9; $('span').value=54.4; $('trafficRole').value='main'; syncBasics(); Object.assign(scoreValues,{P12:10,P14:0,P15:3,P21:2,P31:7,P32:0,P41:0,P42:5,P43:0,C31:10,C32:10,C41:0,C42:10}); Object.entries(scoreValues).forEach(([k,v])=>{if($(k))$(k).value=v}); update(); }
function init(){renderFields(likelihood,'likelihoodFields');renderFields(consequence,'consequenceFields');document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');$(b.dataset.tab).classList.add('active')}));document.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',()=>{if(['condition','serviceYears','maintenance','bridgeType','length','span','trafficRole'].includes(e.id))syncBasics();update()}));$('exampleBtn').addEventListener('click',loadExample);$('printBtn').addEventListener('click',()=>window.print());syncBasics();update();}
init();
