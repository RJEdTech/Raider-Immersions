/* Raider Immersions: trip pages built from the research packets (trips/<id>.js) and the shared Denver mirror (trips/denver-mirror.js).
   Every number shows its source and a mark: checked, or read-with-care (with the caveat). Nothing unverified is in the data files.
   Each lab has its own address (#peru/labs/E) so the page counter records which labs are used. */
(function(){'use strict';
var T=window.TRIPS||{},M=window.DMIRROR||{},D=window.DENVER,$=function(s,r){return (r||document).querySelector(s)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function md(s){return esc(s).replace(/\*\*\*(.+?)\*\*\*/g,'<b><i>$1</i></b>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,'<i>$1</i>')
  .replace(/✅/g,'<span class="pill ok" title="Checked against the source">checked</span>').replace(/⚠️?/g,'<span class="pill care" title="Real, but read the note">read with care</span>')}
function store(k,v){try{if(v===undefined)return localStorage.getItem('imm:'+k)||'';localStorage.setItem('imm:'+k,v)}catch(e){return ''}}
function fmt(n,d){return Number(n).toLocaleString('en-US',{maximumFractionDigits:d==null?0:d,minimumFractionDigits:d||0})}
function miles(a){var R=3958.8,r=Math.PI/180,dl=(a.lat-D.lat)*r,dn=(a.lon-D.lon)*r,h=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(D.lat*r)*Math.cos(a.lat*r)*Math.sin(dn/2)*Math.sin(dn/2);return Math.round(2*R*Math.asin(Math.sqrt(h))/10)*10}
function answerBox(k,label){return '<label class="ans"><span>'+esc(label||'Your answer')+'</span><textarea data-k="'+esc(k)+'" rows="3">'+esc(store(k))+'</textarea></label>'}
function wireAnswers(root){root.querySelectorAll('textarea[data-k]').forEach(function(t){t.oninput=function(){store(t.dataset.k,t.value)}})}
function copyBtn(id){return '<p><button class="btn" data-copy="'+id+'">Copy my answers</button> <span class="muted" data-copied="'+id+'"></span></p>'}
function wireCopy(root,title){root.querySelectorAll('[data-copy]').forEach(function(b){b.onclick=function(){
  var parts=[];root.querySelectorAll('label.ans').forEach(function(l){var t=$('textarea',l);parts.push(l.querySelector('span').textContent+'\n'+(t.value||'(blank)'))});
  var txt=title+'\n\n'+parts.join('\n\n'),out=root.querySelector('[data-copied="'+b.dataset.copy+'"]');
  try{navigator.clipboard.writeText(txt).then(function(){out.textContent='Copied. Paste it into Canvas.'},function(){out.textContent='Select the text and copy it instead.'})}catch(e){out.textContent='Select the text and copy it instead.'}}})}

/* find a link for a source line, so every number has a "Check it yourself" */
function srcUrl(t,src){if(!src)return '';var words=src.replace(/[*,().]/g,' ').split(/\s+/).filter(function(w){return w.length>3}).slice(0,3);
  var best='';(t.sources||[]).forEach(function(g){g.items.forEach(function(it){if(!it.url||best)return;var hit=words.filter(function(w){return it.t.indexOf(w)>=0}).length;if(hit>=Math.min(2,words.length))best=it.url})});return best}
function numberCard(t,n){var u=srcUrl(t,n.src);
  return '<li class="num"><div>'+md(n.text)+'</div><div class="src">'+(n.src?'Source: '+md(n.src)+' ':'')+
   (n.mark==='ok'?'<span class="pill ok">checked</span>':n.mark==='care'?'<span class="pill care">read with care</span>':'')+
   (n.note?' <span class="note">'+md(n.note)+'</span>':'')+(u?' · <a href="'+esc(u)+'" target="_blank" rel="noopener">Check it yourself</a>':'')+'</div></li>'}

var TABS=[['over','The place'],['bar','Barriers'],['cush','What catches you'],['labs','Labs'],['before','Before you go'],['after','After you return'],['faith','Faith'],['src','Sources']];

function page(t,tab,sub){
  document.title=t.name+' · Raider Immersions';tab=tab||'over';
  var app=$('#app');
  app.innerHTML='<a class="back" href="#">← All immersions</a><p class="kick">Immersion · research as of '+esc(t.asOf)+'</p><h2 style="margin-top:0">'+esc(t.name)+'</h2>'+
   '<div class="tabs" role="tablist">'+TABS.map(function(x){return '<button role="tab" aria-selected="'+(x[0]===tab)+'" data-tab="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div><div id="pane"></div>';
  app.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){location.hash=t.id+'/'+b.dataset.tab}});
  var pane=$('#pane');
  ({over:over,bar:barriers,cush:cushion,labs:labs,before:before,after:after,faith:faith,src:sources}[tab]||over)(t,pane,sub);
  wireAnswers(pane);wireCopy(pane,t.name+' · '+(TABS.filter(function(x){return x[0]===tab})[0]||TABS[0])[1]);
  if(sub==null)window.scrollTo(0,0)}

function over(t,p){var up=t.ft-D.ft;
  p.innerHTML='<p class="lede">'+esc(t.region)+'.</p><div class="stats">'+
   (miles(t)<30?'<div class="stat"><b>Here</b><span>in the Denver metro</span></div>':'<div class="stat"><b>'+fmt(miles(t))+' mi</b><span>from Denver, in a straight line</span></div>')+
   '<div class="stat"><b>'+fmt(t.ft)+' ft</b><span>'+(Math.abs(up)<300?'about the same as Denver':up>0?fmt(up)+' ft higher than Denver':fmt(-up)+' ft lower than Denver')+'</span></div>'+
   '<div class="stat"><b style="font-size:19px">'+esc(t.lang)+'</b><span>what you will hear</span></div></div>'+
   (t.partner?'<h3>Who we go with</h3><p>'+(t.partner.url?'<a href="'+esc(t.partner.url)+'" target="_blank" rel="noopener"><b>'+esc(t.partner.name)+'</b></a>':'<b>'+esc(t.partner.name)+'</b>')+'</p>':'')+
   t.place.map(function(b){return '<h3>'+md(b.h)+'</h3>'+(b.text?'<p>'+md(b.text)+'</p>':'')+(b.items.length?'<ul class="tl">'+b.items.map(function(i){return '<li>'+md(i)+'</li>'}).join('')+'</ul>':'')}).join('')+
   (t.web?'<h3>How the barriers stack</h3><div class="claim">'+md(t.web)+'</div><p><a class="btn" href="#'+t.id+'/bar">See the barriers →</a></p>':'')}

function barriers(t,p,sub){
  var i=sub==null?null:sub;
  p.innerHTML='<p class="lede">A barrier decides what an ordinary situation costs a family here. The test: if one family worked twice as hard, would they get past it? If not, it is built into the place. Pick one.</p>'+
   '<div class="areas">'+t.barriers.map(function(b,k){return '<a class="area-btn" href="#'+t.id+'/bar/'+(k+1)+'" aria-current="'+(k===i)+'"><span class="n">'+(k+1)+'</span><b>'+md(b.title)+'</b></a>'}).join('')+'</div><div id="bar"></div>';
  if(i!=null&&t.barriers[i])barrier(t,i,$('#bar',p))}

function barrier(t,i,box){
  var b=t.barriers[i],k=t.id+':sort:'+i,mine=store(k);
  var keys=(b.denverKeys||[]).filter(function(x){return M[x]});
  box.innerHTML='<div class="area" id="bar-top"><p class="kick">Barrier '+(i+1)+' of '+t.barriers.length+'</p><h3 style="margin-top:0">'+md(b.title)+'</h3>'+
   (b.plain?'<p class="lede">'+md(b.plain)+'</p>':'')+
   (b.chain&&b.chain.length?'<div class="sec"><p class="kick">How it got this way</p><ol class="chain">'+b.chain.map(function(s){return '<li>'+md(s.charAt(0).toUpperCase()+s.slice(1))+'</li>'}).join('')+'</ol>'+
     (b.oneDay?'<div class="oneday"><b>One day:</b> '+md(b.oneDay.charAt(0).toUpperCase()+b.oneDay.slice(1))+'</div>':'')+'</div>':'')+
   (b.numbers.length?'<div class="sec"><p class="kick">The numbers</p><ul class="nums">'+b.numbers.map(function(n){return numberCard(t,n)}).join('')+'</ul></div>':'')+
   '<div class="sec"><p class="kick">Pull it apart</p><p>Before you read ours: where does most of this barrier come from?</p><div class="sort">'+['Nature','Luck','Built'].map(function(n){return '<button data-s="'+n+'" class="'+(mine===n?'on':'')+'">'+n+'</button>'}).join('')+'</div>'+
   (mine?(b.nlb?'<div class="nlbt">'+md(b.nlb)+'</div>':'')+
     (b.who?'<p class="kick" style="margin-top:14px">Who decided, who gains, who pays</p><div class="gains">'+md(b.who)+'</div>':'')+
     (b.contested?'<p class="kick" style="margin-top:14px">What nobody knows yet</p><p>'+md(b.contested)+'</p>':''):'')+'</div>'+
   (b.doing?'<div class="sec doing"><p class="kick">What people here already do</p><p>'+md(b.doing)+'</p></div>':'')+
   ((b.denver||b.mirrorQ)?'<div class="sec mirror"><p class="kick">The same structure in Denver</p>'+(b.denver?'<p>'+md(b.denver)+'</p>':'')+
     (keys.length?'<p class="muted">More on Denver: '+keys.map(function(x){return '<a href="#denver-mirror/'+x+'">'+esc(M[x].title)+'</a>'}).join(' · ')+'</p>':'')+
     (b.mirrorQ?answerBox(t.id+':mirror:'+i,b.mirrorQ):'')+'</div>':'')+
   copyBtn('bar')+
   '<p style="margin-top:16px">'+(i>0?'<a class="btn ghost" href="#'+t.id+'/bar/'+i+'">← Barrier '+i+'</a> ':'')+(i<t.barriers.length-1?'<a class="btn" style="text-decoration:none" href="#'+t.id+'/bar/'+(i+2)+'">Barrier '+(i+2)+' →</a>':'')+'</p></div>';
  box.querySelectorAll('[data-s]').forEach(function(x){x.onclick=function(){store(k,x.dataset.s);barrier(t,i,box);wireAnswers(box);wireCopy(box,t.name+' · Barrier '+(i+1))}});
  var top=$('#bar-top');if(top&&top.scrollIntoView)top.scrollIntoView({block:'start'})}

function mirrorLine(keys){var k=(keys||[]).filter(function(x){return M[x]})[0];if(!k)return '';var f=(M[k].figures||[])[0];
  return (f?md(f.text):md(M[k].plain||''))+' <a href="#denver-mirror/'+k+'">More</a>'}
function cushion(t,p){
  p.innerHTML='<p class="lede">When something goes wrong (a broken leg, a hailstorm, a death), what catches a family? Most of these cushions are invisible to the people inside them. Read across each row: there, and at home.</p>'+
   '<div class="cush"><div class="ch"><span></span><b>'+esc(t.short)+'</b><b>Denver and Colorado</b></div>'+
   t.cushion.map(function(r){var dv=r.denver.text?md(r.denver.text):mirrorLine(r.denver.keys);
     return '<div class="cr"><span class="cl">'+md(r.label)+'</span><div class="there">'+(r.there.text?md(r.there.text):'<span class="muted">Not yet sourced.</span>')+'</div><div class="home">'+(dv||'<span class="muted">Not yet sourced.</span>')+'</div></div>'}).join('')+'</div>'+
   (t.cushionNotice?'<div class="claim">'+md(t.cushionNotice)+'</div>':'')+
   '<p><a class="btn" href="#'+t.id+'/labs/E">Try it: One bad week →</a></p>'}

/* ---------- labs ---------- */
function labList(t){var L=(t.labs||[]).slice(),I=t.interactive||{};
  Object.keys(I).forEach(function(k){if(!L.some(function(l){return l.key===k})&&I[k].title)L.push({key:k,title:I[k].title,question:I[k].question,notice:I[k].notice,yourCall:I[k].yourCall})});
  return L}
function labs(t,p,sub){var L=labList(t);
  if(sub==null||!L.filter(function(l){return l.key===sub})[0]){
    p.innerHTML='<p class="lede">Change the numbers and watch what happens. Every number in a lab comes from a source you can check.</p><div class="grid">'+
     L.map(function(l){var kind=(t.interactive||{})[l.key];return '<a class="card" href="#'+t.id+'/labs/'+l.key+'"><span class="badge'+(kind?' ready':'')+'">'+(kind?'Interactive':'Think it through')+'</span><h3>'+md(l.title)+'</h3><div class="meta">'+md(l.question)+'</div></a>'}).join('')+'</div>';return}
  var l=L.filter(function(x){return x.key===sub})[0],cfg=(t.interactive||{})[sub];
  p.innerHTML='<a class="back" href="#'+t.id+'/labs">← All labs</a><h3>'+md(l.title)+'</h3><p class="lede">'+md(l.question)+'</p><div id="lab"></div>'+
   '<div class="sec"><details><summary><b>What to notice</b> (open after you try it)</summary><p>'+md(l.notice||'')+'</p></details></div>'+
   (l.denverRun&&!(cfg&&cfg.denver)?'<div class="sec mirror"><p class="kick">Run it in Denver</p><p>'+md(l.denverRun.charAt(0).toUpperCase()+l.denverRun.slice(1))+'</p></div>':'')+
   answerBox(t.id+':lab:'+sub,l.yourCall||'Your call')+copyBtn('lab');
  var box=$('#lab',p);
  if(cfg&&cfg.kind==='OneBadWeek')oneBadWeek(t,cfg,box);
  else if(cfg&&cfg.kind==='TwoWays')twoWays(t,cfg,box);
  else if(cfg&&cfg.kind==='LoanCost')loanCost(t,cfg,box);
  else if(cfg&&cfg.kind==='WhoDecides')whoDecides(t,cfg,box);
  else if(cfg&&cfg.kind==='HoursOfWork')hoursOfWork(t,cfg,box);
  else box.innerHTML=(l.changes?'<div class="sec"><p class="kick">What you change</p><p>'+md(l.changes)+'</p></div>':'')+(l.data?'<div class="sec"><p class="kick">The real numbers</p><p>'+md(l.data)+'</p></div>':'')}

function oneBadWeek(t,c,box){
  var MINE_LEND=[{label:'Family who would lend at no interest',rate:0,note:'No interest, if someone can.'},{label:'A credit card',monthly:0.2119/12,note:'Average card rate: 21.19% a year (Federal Reserve, Q3 2026).'},{label:"A small loan under Colorado's 36% cap",monthly:0.03,note:'Colorado caps small loans at 36% a year (Prop 111, 2018).'},{label:'No one would lend',none:true,note:'Nowhere to borrow.'}];
  var fams=c.families.slice();if(c.mine!==false)fams.push({id:'mine',mine:true,label:'A family like mine'});
  var st={shock:c.shocks[0].id,weeks:null,extra:null,sav:{},ins:{},ln:{},mine:{lw:0,ls:70,lend:0}};
  fams.forEach(function(f){st.sav[f.id]=f.mine?2:f.savings;st.ins[f.id]=!!f.lifeInsLikely;st.ln[f.id]=0});
  function loanOf(f){if(f.mine)return MINE_LEND[st.mine.lend];var L=f.loanOptions;return L?L[st.ln[f.id]]:{rate:f.loanRate,note:f.loanNote}}
  function draw(){
    var s=c.shocks.filter(function(x){return x.id===st.shock})[0],wk=st.weeks==null?s.weeks:st.weeks,ex=st.extra==null?s.extra:st.extra,max=1;
    var rows=fams.map(function(f){
      var lb=(f.leaveBy||{})[s.id],lw=f.mine?st.mine.lw:lb?lb[0]:f.leaveWeeks,ls=f.mine?st.mine.ls/100:lb?lb[1]:f.leaveShare,lost=f.fixedIncome?0:wk;
      var leave=Math.min(lost,lw)*ls,sav=st.sav[f.id],need=lost-leave+ex,ins=s.id==='death'&&st.ins[f.id],L=loanOf(f);
      if(ins){leave=0;need=0}
      var fromSav=Math.min(sav,need),gap=Math.max(0,need-fromSav),known=L.rate!=null||L.monthly!=null||L.none,
          interest=!known||L.none?0:L.monthly!=null?gap*L.monthly*6:gap*(Math.pow(1+L.rate,0.5)-1);
      var r={f:f,L:L,known:known,leave:leave,sav:fromSav,gap:gap,interest:interest,ins:ins};max=Math.max(max,leave+fromSav+gap+interest);return r});
    var W=100/max;
    box.innerHTML=(c.note?'<p class="muted">'+esc(c.note)+'</p>':'')+'<div class="sec"><p class="kick">1 · Pick what happens</p><div class="sort">'+c.shocks.map(function(x){return '<button data-sh="'+x.id+'" class="'+(x.id===st.shock?'on':'')+'">'+esc(x.label)+'</button>'}).join('')+'</div>'+
     '<div class="sliders"><label>Weeks without pay: <b>'+wk+'</b><input type="range" min="0" max="52" value="'+wk+'" data-r="weeks"></label>'+
     '<label>Extra costs, in weeks of pay: <b>'+ex+'</b><input type="range" min="0" max="20" value="'+ex+'" data-r="extra"></label><p class="muted" style="font-size:14px">These two are examples you can change, not data. Everything below each family comes from a source.</p></div></div>'+
     '<div class="sec"><p class="kick">2 · Watch '+(['','one family','two families','three families','four families','five families'][fams.length]||fams.length+' families')+'</p><p class="muted" style="font-size:14px">Measured in weeks of that family\'s own pay, so they can be compared.</p>'+
     rows.map(function(r){var f=r.f;return '<div class="fam"><h4>'+esc(f.label)+'</h4>'+
       '<div class="stack" role="img" aria-label="'+esc(f.label)+': '+fmt(r.leave,1)+' weeks paid leave, '+fmt(r.sav,1)+' from savings, '+fmt(r.gap,1)+' borrowed'+(r.known?', '+fmt(r.interest,1)+' interest':', interest unknown')+'">'+
        (r.ins?'<span class="sg ins" style="width:100%">Life insurance pays</span>':
        '<span class="sg leave" style="width:'+(r.leave*W)+'%"></span><span class="sg sav" style="width:'+(r.sav*W)+'%"></span><span class="sg gap" style="width:'+(r.gap*W)+'%"></span><span class="sg int" style="width:'+(r.interest*W)+'%"></span>')+'</div>'+
       '<p class="fsum">'+(r.ins?'Covered by life insurance.':(r.gap>0&&r.L.none?'Is short <b>'+fmt(r.gap,1)+' weeks</b> of pay, with no one to borrow from: bills go unpaid.':r.gap>0?'Has to borrow <b>'+fmt(r.gap,1)+' weeks</b> of pay'+(r.known?' and pay back <b>'+fmt(r.interest,1)+' more</b> in six months of interest.':'. What that costs here is <b>not yet sourced</b>: find it.'):'Gets through without borrowing.'))+'</p>'+
       '<label class="sl">Savings, in weeks of pay: <b>'+st.sav[f.id]+'</b><input type="range" min="0" max="26" value="'+st.sav[f.id]+'" data-sv="'+f.id+'"></label>'+
       (f.mine?'<p class="muted" style="font-size:14px">This card is yours to set. It stays on this page: it is not saved and not sent anywhere. RJ families are not all like the salaried family above; set what is true, or leave it.</p>'+
        '<label class="sl">Paid leave, in weeks: <b>'+st.mine.lw+'</b><input type="range" min="0" max="12" value="'+st.mine.lw+'" data-mn="lw"></label>'+
        '<label class="sl">Share of pay while on leave: <b>'+st.mine.ls+'%</b><input type="range" min="0" max="100" step="10" value="'+st.mine.ls+'" data-mn="ls"></label>'+
        '<label class="sl">Who would lend: <select data-mn="lend">'+MINE_LEND.map(function(o,i){return '<option value="'+i+'"'+(i===st.mine.lend?' selected':'')+'>'+esc(o.label)+'</option>'}).join('')+'</select></label>':'')+
       (f.loanOptions&&f.loanOptions.length>1?'<label class="sl">Who will lend: <select data-ln="'+f.id+'">'+f.loanOptions.map(function(o,i){return '<option value="'+i+'"'+(i===st.ln[f.id]?' selected':'')+'>'+esc(o.label)+'</option>'}).join('')+'</select></label>':'')+
       (s.id==='death'?'<label class="chk"><input type="checkbox" data-in="'+f.id+'"'+(st.ins[f.id]?' checked':'')+'> Has life insurance</label>':'')+
       (f.mine?'<ul class="cus"><li>'+esc(r.L.note)+'</li></ul>':'<ul class="cus">'+(f.fixedIncome?'<li>'+esc(f.incomeNote||'')+'</li>':'')+'<li>'+esc(f.leaveNote)+'</li><li>'+esc(f.health)+'</li><li>'+esc(r.L.note||'')+'</li>'+(s.id==='death'?'<li>'+esc(f.lifeInsNote)+'</li>':'')+'</ul>')+'</div>'}).join('')+
     '<p class="legend"><span class="sg leave"></span> paid leave <span class="sg sav"></span> savings <span class="sg gap"></span> borrowed <span class="sg int"></span> interest</p></div>';
    box.querySelectorAll('[data-sh]').forEach(function(b){b.onclick=function(){st.shock=b.dataset.sh;st.weeks=null;st.extra=null;draw()}});
    box.querySelectorAll('[data-r]').forEach(function(r){r.oninput=function(){st[r.dataset.r]=+r.value;draw();var x=box.querySelector('[data-r="'+r.dataset.r+'"]');x&&x.focus()}});
    box.querySelectorAll('[data-sv]').forEach(function(r){r.oninput=function(){st.sav[r.dataset.sv]=+r.value;draw();var x=box.querySelector('[data-sv="'+r.dataset.sv+'"]');x&&x.focus()}});
    box.querySelectorAll('[data-ln]').forEach(function(r){r.onchange=function(){st.ln[r.dataset.ln]=+r.value;draw();var x=box.querySelector('[data-ln="'+r.dataset.ln+'"]');x&&x.focus()}});
    box.querySelectorAll('[data-mn]').forEach(function(r){var k=r.dataset.mn;r[r.tagName==='SELECT'?'onchange':'oninput']=function(){st.mine[k]=+r.value;draw();var x=box.querySelector('[data-mn="'+k+'"]');x&&x.focus()}});
    box.querySelectorAll('[data-in]').forEach(function(r){r.onchange=function(){st.ins[r.dataset.in]=r.checked;draw()}})}
  draw()}

function dots(v){var s='';for(var i=0;i<100;i++)s+='<i class="'+(i<Math.round(v)?'on':'')+'"></i>';return '<div class="dots" role="img" aria-label="'+v+' out of 100">'+s+'</div>'}
function twoWays(t,c,box){var pi=0,V=function(id){return c.views.filter(function(v){return v.id===id})[0]};
  function draw(){var pr=c.pairs[pi].map(V);
    box.innerHTML='<div class="sec"><p class="kick">Pick two ways to count</p><div class="sort">'+c.pairs.map(function(pp,k){var lab=(c.pairLabels||[])[k]||(V(pp[0]).label.replace(/,.*$/,'')+(k===2?' (urban vs rural)':' (two methods)'));return '<button data-p="'+k+'" class="'+(k===pi?'on':'')+'">'+esc(lab)+'</button>'}).join('')+'</div></div>'+
     '<div class="pair">'+pr.map(function(v){var m=v.mark||'ok';return '<div class="pv"><b class="big">'+fmt(v.value,1)+'%</b><p>'+esc(v.label)+'</p>'+dots(v.value)+'<p class="src">Source: '+esc(v.src)+' <span class="pill '+m+'">'+(m==='ok'?'checked':'read with care')+'</span>'+(v.caveat?'<br><small>'+esc(v.caveat)+'</small>':'')+'</p></div>'}).join('')+'</div>'+
     '<p class="muted">'+esc(c.caption||'Each dot is one child out of 100 aged 6–35 months. Same children, same year: the only thing that changed is the rule for counting, or where you drew the line.')+'</p>';
    box.querySelectorAll('[data-p]').forEach(function(b){b.onclick=function(){pi=+b.dataset.p;draw()}})}
  draw()}

function srcLink(d){return d.url?'<a href="'+esc(d.url)+'" target="_blank" rel="noopener">'+esc(d.src)+'</a>':esc(d.src)}
function whoDecides(t,c,box){var st={dv:false,g:{},rev:{}};
  function draw(){var set=st.dv?c.denver:c,L=set.levels,D=set.decisions,pre=st.dv?'d':'t',done=0,right=0,cnt={};
    L.forEach(function(l){cnt[l.id]=0});
    var tried=0;D.forEach(function(d,i){cnt[d.level]++;var g=st.g[pre+i];if(g!=null){done++;if(!st.rev[pre+i]){tried++;if(g===d.level)right++}}});
    box.innerHTML=(c.denver?'<div class="sec"><div class="sort"><button data-dv="0" class="'+(!st.dv?'on':'')+'">'+esc(t.short)+'</button><button data-dv="1" class="'+(st.dv?'on':'')+'">Run it in Denver</button></div></div>':'')+
     '<p class="muted">For each decision, tap who you think made it. Then read what happened.</p>'+
     D.map(function(d,i){var k=pre+i,g=st.g[k];return '<div class="wd'+(g!=null?' done':'')+'"><p class="wq">'+md(d.q)+'</p><div class="sort">'+
       L.map(function(l){var cls=g==null?'':l.id===d.level?' right':g===l.id?' wrong':'';return '<button data-k="'+k+'" data-l="'+l.id+'" class="'+cls.trim()+'">'+esc(l.label)+'</button>'}).join('')+'</div>'+
       (g!=null?'<p class="fsum">'+(g===d.level?'<b>Yes.</b> ':'<b>It was '+esc(L.filter(function(l){return l.id===d.level})[0].label)+'.</b> ')+md(d.detail)+' <span class="pill '+(d.mark||'ok')+'">'+((d.mark||'ok')==='ok'?'checked':'read with care')+'</span><br><small>Source: '+srcLink(d)+'</small></p>':'')+'</div>'}).join('')+
     (done<D.length?'<p><button class="linkish" data-all>Show every answer</button></p>':'')+
     (done===D.length?'<div class="sec"><p class="kick">Who decided these '+D.length+'</p>'+L.map(function(l){return '<div class="wdbar"><span>'+esc(l.label)+'</span><span class="bar"><span class="sg '+(l.home?'leave':'gap')+'" style="width:'+(cnt[l.id]/D.length*100)+'%"></span></span><b>'+cnt[l.id]+'</b></div>'}).join('')+
       (tried?'<p class="muted">You matched '+right+' of the '+tried+' you tried.</p>':'')+'</div>':'');
    box.querySelectorAll('[data-dv]').forEach(function(b){b.onclick=function(){st.dv=b.dataset.dv==='1';draw()}});
    box.querySelectorAll('[data-k]').forEach(function(b){b.onclick=function(){if(st.g[b.dataset.k]==null){st.g[b.dataset.k]=b.dataset.l;draw()}}});
    var a=box.querySelector('[data-all]');a&&(a.onclick=function(){D.forEach(function(d,i){if(st.g[pre+i]==null){st.g[pre+i]=d.level;st.rev[pre+i]=1}});draw()})}
  draw()}

function hoursOfWork(t,c,box){var st={people:c.people||4,rides:c.rides||44,rent:{}};
  c.places.forEach(function(p){if(p.rent.amt==null)st.rent[p.id]=p.rent.guess});
  function draw(){var R=c.places.map(function(p){var rent=p.rent.amt!=null?p.rent.amt:st.rent[p.id],
      it=[{k:'food',lab:'Food for the household',h:p.food.pp*st.people/p.wage},{k:'rent',lab:'Rent',h:rent/p.wage},{k:'bus',lab:'Bus rides',h:p.bus.fare*st.rides/p.wage}],
      tot=it.reduce(function(a,b){return a+b.h},0);return {p:p,it:it,tot:tot,rent:rent}}),
      max=Math.max.apply(null,R.map(function(r){return Math.max(r.tot,r.p.month)}));
    box.innerHTML='<div class="sec"><div class="sliders"><label>People in the household: <b>'+st.people+'</b><input type="range" min="1" max="6" value="'+st.people+'" data-hw="people"></label>'+
      '<label>Bus rides a month: <b>'+st.rides+'</b><input type="range" min="0" max="120" value="'+st.rides+'" data-hw="rides"></label>'+
      c.places.filter(function(p){return p.rent.amt==null}).map(function(p){return '<label>'+esc(p.rent.label)+': <b>'+p.cur+fmt(st.rent[p.id])+'</b><input type="range" min="'+p.rent.min+'" max="'+p.rent.max+'" step="'+p.rent.step+'" value="'+st.rent[p.id]+'" data-rent="'+p.id+'"></label><p class="muted" style="font-size:14px">'+esc(p.rent.note)+'</p>'}).join('')+
      '</div></div>'+
      R.map(function(r){var p=r.p;return '<div class="fam"><h4>'+esc(p.label)+'</h4><p class="muted" style="font-size:14px">Minimum wage: '+esc(p.wageText)+'</p>'+
        '<div class="stack hw" role="img" aria-label="'+esc(p.label)+': '+fmt(r.tot)+' hours of work a month">'+r.it.map(function(x){return '<span class="sg '+({food:'leave',rent:'gap',bus:'sav'})[x.k]+'" style="width:'+(x.h/max*100)+'%"></span>'}).join('')+'<i class="mark" style="left:'+(p.month/max*100)+'%"></i></div>'+
        '<p class="fsum"><b>'+fmt(r.tot)+' hours</b> of minimum-wage work a month. One full-time worker has about '+fmt(p.month)+', so this household needs <b>'+fmt(r.tot/p.month,1)+' full-time earners</b>.</p>'+
        '<ul class="cus">'+r.it.map(function(x){var src=x.k==='food'?p.food:x.k==='rent'?p.rent:p.bus;return '<li><b>'+x.lab+'</b>: '+fmt(x.h)+' hours. '+esc(src.text||'')+' <small>Source: '+srcLink(src)+'</small></li>'}).join('')+'<li><small>Wage source: '+srcLink(p.wageSrc)+'</small></li></ul></div>'}).join('')+
      '<p class="legend"><span class="sg leave"></span> food <span class="sg gap"></span> rent <span class="sg sav"></span> bus <i class="mark inline"></i> one full-time month</p>';
    box.querySelectorAll('[data-hw]').forEach(function(r){r.oninput=function(){st[r.dataset.hw]=+r.value;draw();box.querySelector('[data-hw="'+r.dataset.hw+'"]').focus()}});
    box.querySelectorAll('[data-rent]').forEach(function(r){r.oninput=function(){st.rent[r.dataset.rent]=+r.value;draw();box.querySelector('[data-rent="'+r.dataset.rent+'"]').focus()}})}
  draw()}

function loanCost(t,c,box){var start=function(d){return JSON.parse(JSON.stringify((d&&d.start)||{papers:true}))},st={dv:false,amt:c.amount,g:start(c)};
  function pct(n){return Number(n).toLocaleString('en-US',{maximumFractionDigits:2})}
  function rateText(o){return o.rateText||(o.monthly!=null?'about '+pct(o.monthly*100)+'% a month':o.rate===0?'no interest':pct(o.rate*100)+'% a year')}
  function draw(){var dv=st.dv&&c.denver,opts=dv?c.denver.options:c.options,gates=dv?c.denver.gates:c.gates,cur=dv?c.denver.currency:(t.currency||''),res=[],max=1;
    opts.forEach(function(o){var n=o.months||c.months,ok=o.needs.every(function(g){return st.g[g]}),size=(o.maxAmt&&st.amt>o.maxAmt)?'Lends at most '+cur+fmt(o.maxAmt)+'.':(o.minAmt&&st.amt<o.minAmt)?'Won\'t lend less than '+cur+fmt(o.minAmt)+'.':'',
      r=o.monthly!=null?o.monthly:o.apr?o.rate/12:Math.pow(1+o.rate,1/12)-1,pay=r?st.amt*r/(1-Math.pow(1+r,-n)):st.amt/n,tot=pay*n;if(o.capTotal)tot=Math.min(tot,st.amt*(1+o.capTotal));
      res.push({o:o,n:n,ok:ok&&!size,size:size,need:!ok,tot:tot,int:tot-st.amt});if(ok&&!size)max=Math.max(max,tot)});
    box.innerHTML='<div class="sec"><div class="sort"><button data-dv="0" class="'+(!st.dv?'on':'')+'">'+esc(t.short)+'</button>'+(c.denver?'<button data-dv="1" class="'+(st.dv?'on':'')+'">Run it in Denver</button>':'')+'</div>'+
     '<div class="sliders"><label>How much: <b>'+cur+fmt(st.amt)+'</b><input type="range" min="'+(dv?(c.denver.min||100):c.min)+'" max="'+(dv?(c.denver.max||3000):c.max)+'" step="'+(dv?(c.denver.step||50):c.step)+'" value="'+st.amt+'" data-amt></label><p class="muted" style="font-size:14px">Paid back in equal monthly payments: '+c.months+' months unless a lender sets its own term.</p></div>'+
     '<p class="kick">What this family has</p>'+gates.map(function(g){return '<label class="chk"><input type="checkbox" data-g="'+g.id+'"'+(st.g[g.id]?' checked':'')+'> '+esc(g.label)+'</label>'}).join('')+'</div>'+
     '<div class="sec">'+res.map(function(r){var o=r.o;return '<div class="loan'+(r.ok?'':' off')+'"><div class="lt"><b>'+esc(o.label)+'</b> · '+rateText(o)+(o.months?' · '+o.months+' months':'')+'<br><small>'+esc(o.src)+'</small>'+(o.wait?'<br><small><b>The wait:</b> '+esc(o.wait)+'</small>':'')+'</div>'+
       (r.ok?'<div class="bar"><span class="sg sav" style="width:'+(st.amt/max*100)+'%"></span><span class="sg int" style="width:'+(r.int/max*100)+'%"></span></div><div class="lt">Pays back <b>'+cur+fmt(r.tot)+'</b>: '+cur+fmt(r.int)+' in interest and fees</div>':
        '<div class="lt muted">'+(r.need?'Not open to this family. Needs: '+o.needs.map(function(g){return (gates.filter(function(x){return x.id===g})[0]||{label:g}).label.replace(/^Has /,'').replace(/^Belongs/,'belongs').replace(/^Can /,'can ').replace(/^Owns /,'owns ').replace(/^Is /,'is ')}).join(' and ')+'.':'')+(r.size?' '+r.size:'')+'</div>')+'</div>'}).join('')+
     '<p class="legend"><span class="sg sav"></span> the loan <span class="sg int"></span> interest and fees</p></div>';
    box.querySelectorAll('[data-dv]').forEach(function(b){b.onclick=function(){st.dv=b.dataset.dv==='1';st.amt=st.dv?c.denver.amount:c.amount;st.g=start(st.dv?c.denver:c);draw()}});
    box.querySelectorAll('[data-g]').forEach(function(b){b.onchange=function(){st.g[b.dataset.g]=b.checked;draw()}});
    var a=box.querySelector('[data-amt]');a.oninput=function(){st.amt=+a.value;draw();box.querySelector('[data-amt]').focus()}}
  draw()}

/* ---------- before / after / faith / sources ---------- */
function before(t,p){
  p.innerHTML='<h3>The fences in us</h3><p class="lede">What keeps us from seeing this place clearly. Read these before you pack.</p><div class="fences">'+
   (t.fences||[]).map(function(f){return '<div class="fence"><b>'+md(f.h)+'</b><p>'+md(f.text)+'</p></div>'}).join('')+'</div>'+
   (t.carry||[]).map(function(c){return '<h3>'+md(c.h.replace(/\s*\(.*\)/,''))+'</h3><ul>'+c.items.map(function(i){return '<li>'+md(i)+'</li>'}).join('')+'</ul>'}).join('')+
   '<h3>Before you go</h3><p class="muted">Your answers stay on this device.</p>'+(window.BEFORE||[]).map(function(q,i){return answerBox(t.id+':before:'+i,(i+1)+'. '+q)}).join('')+copyBtn('before')}
function after(t,p){p.innerHTML='<p class="lede">Do these in the first week home. Your answers stay on this device.</p>'+(window.AFTER||[]).map(function(q,i){return answerBox(t.id+':after:'+i,(i+1)+'. '+q)}).join('')+copyBtn('after')}
function faith(t,p){var th=t.theology||{readings:[]};
  p.innerHTML='<p class="lede">A theology of encounter: what the Church and people of faith say about meeting this place and its people.</p><ul class="read">'+th.readings.map(function(r){return '<li>'+md(r)+'</li>'}).join('')+'</ul>'+
   (th.question?'<div class="claim"><b>Carry this question:</b> '+md(th.question)+'</div>'+answerBox(t.id+':faith',th.question)+copyBtn('faith'):'')}
function sources(t,p){p.innerHTML='<p class="lede">Every number on these pages comes from one of these. Check them yourself: newer data may exist.</p>'+
  (t.sources||[]).map(function(g){return '<h3>'+md(g.h)+'</h3><ul class="src">'+g.items.map(function(i){return '<li>'+(i.url?'<a href="'+esc(i.url)+'" target="_blank" rel="noopener">'+md(i.t)+'</a>':md(i.t))+'</li>'}).join('')+'</ul>'}).join('')+
  ((t.voices||[]).length?'<h2>Voices from the place</h2>'+t.voices.map(function(v){return '<h3>'+md(v.h)+'</h3><ul>'+v.items.map(function(i){return '<li>'+md(i)+'</li>'}).join('')+'</ul>'}).join(''):'')}

/* ---------- the shared Denver page ---------- */
function mirror(key){var app=$('#app');document.title='The same structures in Denver · Raider Immersions';
  var keys=Object.keys(M),k=M[key];
  app.innerHTML='<a class="back" href="#">← All immersions</a><p class="kick">Every trip</p><h2 style="margin-top:0">The same structures in Denver</h2>'+
   '<p class="lede">The cushions that catch a Denver family when something goes wrong, and who they miss. Every trip page links here.</p>'+
   '<div class="areas">'+keys.map(function(x){return '<a class="area-btn" href="#denver-mirror/'+x+'" aria-current="'+(x===key)+'"><b>'+esc(M[x].title)+'</b></a>'}).join('')+'</div>'+
   (k?'<div class="area" id="dm"><h3>'+esc(k.title)+'</h3>'+(k.plain?'<p class="lede">'+md(k.plain)+'</p>':'')+(k.how?'<p>'+md(k.how)+'</p>':'')+
     (k.figures.length?'<p class="kick">The numbers</p><ul class="nums">'+k.figures.map(function(f){return '<li class="num">'+md(f.text)+(f.mark==='ok'?' <span class="pill ok">checked</span>':f.mark==='care'?' <span class="pill care">read with care</span>':'')+'</li>'}).join('')+'</ul>':'')+
     (k.misses.length?'<p class="kick">Who it misses</p><ul>'+k.misses.map(function(m){return '<li>'+md(typeof m==='string'?m:m.text)+'</li>'}).join('')+'</ul>':'')+
     (k.mirrorQ?'<div class="claim"><b>Ask yourself:</b> '+md(k.mirrorQ)+'</div>':'')+
     (k.sources.length?'<p class="muted" style="font-size:14px">Sources: '+k.sources.map(function(u,i){return '<a href="'+esc(u)+'" target="_blank" rel="noopener">'+(i+1)+'</a>'}).join(' · ')+'</p>':'')+'</div>':'');
  var d=$('#dm');if(d&&d.scrollIntoView)d.scrollIntoView({block:'start'});else window.scrollTo(0,0)}

window.TRIP_ROUTE=function(h){
  if(h[0]==='denver-mirror'){mirror(h[1]);return true}
  var t=T[h[0]];if(!t||t.status!=='public')return false;
  var sub=h[2];if(h[1]==='bar'&&sub!=null){sub=parseInt(sub,10)-1;if(isNaN(sub))sub=null}
  page(t,h[1],sub==null?null:sub);return true};
})();
