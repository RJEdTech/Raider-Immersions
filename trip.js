/* Raider Immersions: trip pages built from the research packets (trips/<id>.js) and the shared Denver mirror (trips/denver-mirror.js).
   Every number shows its source and a mark: checked, or read-with-care (with the caveat). Nothing unverified is in the data files.
   Each lab has its own address (#peru/labs/E) so the page counter records which labs are used. */
(function(){'use strict';
var T=window.TRIPS||{},M=window.DMIRROR||{},D=window.DENVER,$=function(s,r){return (r||document).querySelector(s)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function md(s){return esc(s).replace(/\*\*\*(.+?)\*\*\*/g,'<b><i>$1</i></b>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,'<i>$1</i>')
  .replace(/✅/g,'<span class="pill ok" title="Checked against the source">checked</span>').replace(/⚠️?/g,'<span class="pill care" title="Not double-checked against the original source. Check it yourself.">read with care</span>')}
function store(k,v){try{if(v===undefined)return localStorage.getItem('imm:'+k)||'';localStorage.setItem('imm:'+k,v)}catch(e){return ''}}
function fmt(n,d){return Number(n).toLocaleString('en-US',{maximumFractionDigits:d==null?0:d,minimumFractionDigits:d||0})}
function miles(a){var R=3958.8,r=Math.PI/180,dl=(a.lat-D.lat)*r,dn=(a.lon-D.lon)*r,h=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(D.lat*r)*Math.cos(a.lat*r)*Math.sin(dn/2)*Math.sin(dn/2);return Math.round(2*R*Math.asin(Math.sqrt(h))/10)*10}
function answerBox(k,label){return '<label class="ans"><span>'+esc(label||'Your answer')+'</span><textarea data-k="'+esc(k)+'" rows="3">'+esc(store(k))+'</textarea></label>'}
function wireAnswers(root){root.querySelectorAll('textarea[data-k]').forEach(function(t){t.oninput=function(){store(t.dataset.k,t.value)}})}
function copyBtn(id){return '<p><button class="btn" data-copy="'+id+'">Copy my answers</button> <span class="muted" data-copied="'+id+'"></span></p>'}
function wireCopy(root,title){root.querySelectorAll('[data-copy]').forEach(function(b){b.onclick=function(){
  var parts=[];root.querySelectorAll('[data-copyline]').forEach(function(l){if(l.textContent)parts.push(l.textContent)});root.querySelectorAll('label.ans').forEach(function(l){var t=$('textarea',l);parts.push(l.querySelector('span').textContent+'\n'+(t.value||'(blank)'))});
  var txt=title+'\n\n'+parts.join('\n\n'),out=root.querySelector('[data-copied="'+b.dataset.copy+'"]');
  try{navigator.clipboard.writeText(txt).then(function(){out.textContent='Copied. Paste it into Canvas.'},function(){out.textContent='Select the text and copy it instead.'})}catch(e){out.textContent='Select the text and copy it instead.'}}})}

/* find a link for a source line, so every number has a "Check it yourself" */
function srcUrl(t,src){if(!src)return '';var words=src.replace(/[*,().]/g,' ').split(/\s+/).filter(function(w){return w.length>3}).slice(0,3);
  var best='';(t.sources||[]).forEach(function(g){g.items.forEach(function(it){if(!it.url||best)return;var hit=words.filter(function(w){return it.t.indexOf(w)>=0}).length;if(hit>=Math.min(2,words.length))best=it.url})});return best}
function numberCard(t,n){var u=srcUrl(t,n.src);
  return '<li class="num"><div>'+md(n.text)+'</div><div class="src">'+(n.src?'Source: '+md(n.src)+' ':'')+
   (n.mark==='ok'?'<span class="pill ok">checked</span>':n.mark==='care'?'<span class="pill care">read with care</span>':'')+
   (n.note?' <span class="note">'+md(n.note)+'</span>':'')+(u?' · <a href="'+esc(u)+'" target="_blank" rel="noopener">Check it yourself</a>':'')+'</div></li>'}

var TABS=[['see','See it'],['bar','Barriers'],['cush','What catches you'],['labs','Labs'],['act','Respond'],['before','Before you go'],['after','After you return'],['over','The place'],['src','Sources']];

function page(t,tab,sub){
  document.title=t.name+' · Raider Immersions';tab=tab||(allPics(t).length&&!t.weekIntro?'see':'over');if(tab==='faith')tab='act';if(tab==='see'&&!allPics(t).length)tab='over';
  var app=$('#app');
  app.innerHTML='<a class="back" href="#">← All immersions</a><p class="kick">Immersion · research as of '+esc(t.asOf)+'</p><h2 style="margin-top:0">'+esc(t.name)+'</h2>'+
   '<div class="tabs" role="tablist">'+TABS.map(function(x){return '<button role="tab" aria-selected="'+(x[0]===tab)+'" data-tab="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div><div id="pane"></div>';
  app.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){location.hash=t.id+'/'+b.dataset.tab}});
  var pane=$('#pane');
  ({see:see,over:over,bar:barriers,cush:cushion,labs:labs,before:before,after:after,act:respond,src:sources}[tab]||over)(t,pane,sub);
  wireAnswers(pane);wireCopy(pane,t.name+' · '+(TABS.filter(function(x){return x[0]===tab})[0]||TABS[0])[1]);
  if(sub==null||tab==='see')window.scrollTo(0,0)}

function over(t,p){var up=t.ft-D.ft;
  p.innerHTML=(t.weekIntro||'')+'<p class="lede">'+esc(t.region)+'.</p><div class="stats">'+
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

function barrier(t,i,box,keep){
  var b=t.barriers[i],k=t.id+':sort:'+i,mine=store(k);
  var keys=(b.denverKeys||[]).filter(function(x){return M[x]}),nums=b.numbers.filter(function(n){return n.src||!/:\s*$/.test(n.text)}),pics=picsHTML(t,i,true);
  box.innerHTML='<div class="area" id="bar-top"><p class="kick">Barrier '+(i+1)+' of '+t.barriers.length+'</p><h3 style="margin-top:0">'+md(b.title)+'</h3>'+
   (b.plain?'<p class="lede">'+md(b.plain)+'</p>':'')+
   (b.oneDay?'<div class="oneday"><b>One day:</b> '+md(cap(b.oneDay))+'</div>':'')+
   (pics?'<div class="sec"><p class="kick">See it</p>'+pics+'</div>':'')+
   (b.chain&&b.chain.length?'<div class="sec"><p class="kick">How it got this way</p><ol class="chain">'+b.chain.map(function(s){return '<li>'+md(cap(s))+'</li>'}).join('')+'</ol></div>':'')+
   '<div class="sec"><p class="kick">Pull it apart</p><p>Before you read ours: where does most of this barrier come from?</p><div class="sort">'+['Nature','Luck','Built'].map(function(n){return '<button data-s="'+n+'" class="'+(mine===n?'on':'')+'">'+n+'</button>'}).join('')+'</div>'+
   (mine?(b.nlb?'<div class="nlbt">'+md(b.nlb)+'</div>':'')+
     (b.who?'<p class="kick" style="margin-top:14px">Who decided, who gains, who pays</p><div class="gains">'+md(b.who)+'</div>':'')+
     (b.contested?'<p class="kick" style="margin-top:14px">What nobody knows yet</p><p>'+md(b.contested)+'</p>':''):'')+'</div>'+
   (b.doing?'<div class="sec doing"><p class="kick">What people here already do</p><p>'+md(b.doing)+'</p></div>':'')+
   ((b.denver||b.mirrorQ)?'<div class="sec mirror"><p class="kick">The same structure in Denver</p>'+(b.denver?'<p>'+md(b.denver)+'</p>':'')+
     (keys.length?'<p class="muted">More on Denver: '+keys.map(function(x){return '<a href="#denver-mirror/'+x+'">'+esc(M[x].title)+'</a>'}).join(' · ')+'</p>':'')+
     (b.mirrorQ?answerBox(t.id+':mirror:'+i,b.mirrorQ):'')+'</div>':'')+
   '<div class="sec"><p class="kick">Three ways to respond</p>'+hoursHTML(t,i,'What would actually help here?','Why did you split it that way? What would your first block actually be?')+
     '<p class="muted" style="font-size:14px"><a href="#'+t.id+'/act">What the three mean →</a></p></div>'+
   (nums.length?'<div class="sec"><details class="numsd"><summary><b>Check the numbers</b> ('+nums.length+')</summary><ul class="nums">'+nums.map(function(n){return numberCard(t,n)}).join('')+'</ul></details></div>':'')+
   copyBtn('bar')+
   '<p style="margin-top:16px">'+(i>0?'<a class="btn ghost" href="#'+t.id+'/bar/'+i+'">← Barrier '+i+'</a> ':'')+(i<t.barriers.length-1?'<a class="btn" style="text-decoration:none" href="#'+t.id+'/bar/'+(i+2)+'">Barrier '+(i+2)+' →</a>':'')+'</p></div>';
  function again(){barrier(t,i,box,true);wireAnswers(box);wireCopy(box,t.name+' · Barrier '+(i+1))}
  box.querySelectorAll('[data-s]').forEach(function(x){x.onclick=function(){store(k,x.dataset.s);again()}});
  wirePics(box,t,true);
  wireHours(box,t,function(key,dir,kk){again();var nb=box.querySelector('[data-hrs] [data-'+dir+'="'+kk+'"]');if(nb&&!nb.disabled)nb.focus()});
  var top=$('#bar-top');if(!keep&&top&&top.scrollIntoView)top.scrollIntoView({block:'start'})}

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
  Object.keys(I).forEach(function(k){if(!L.some(function(l){return l.key===k})&&I[k].title)L[I[k].first?'unshift':'push']({key:k,title:I[k].title,question:I[k].question,notice:I[k].notice,yourCall:I[k].yourCall})});
  return L}
function labs(t,p,sub){var L=labList(t);
  if(sub==null||!L.filter(function(l){return l.key===sub})[0]){
    p.innerHTML='<p class="lede">Change the numbers and watch what happens. Every number in a lab comes from a source you can check.</p><div class="grid">'+(t.noRoad?'':'<a class="card" href="#road"><span class="badge ready">Simulation · every trip</span><h3>The road north</h3><div class="meta">Six people, six starting points, the rules of November 2026. Every chance is shown with its source. No winning ending.</div></a><a class="card" href="#rules"><span class="badge ready">Simulation · every trip</span><h3>Different rules</h3><div class="meta">Twelve weeks on a real income with real prices. Then the same weeks under Denver\'s rules.</div></a>')+'<a class="card" href="#family"><span class="badge ready">For every trip</span><h3>Your family’s road</h3><div class="meta">How did your family come to be here, under what rules, and why? Compare it with the stories you will hear. Nothing you enter is saved.</div></a>'+
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
  else if(cfg&&cfg.kind==='NoFloor')noFloor(t,cfg,box);
  else if(cfg&&cfg.kind==='SimpleWeek'&&window.SIMPLE_WEEK)window.SIMPLE_WEEK(t,cfg,box);
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
     '<div class="pair">'+pr.map(function(v){var m=v.mark||'ok';return '<div class="pval"><b class="big">'+fmt(v.value,1)+'%</b><p>'+esc(v.label)+'</p>'+dots(v.value)+'<p class="src">Source: '+esc(v.src)+' <span class="pill '+m+'">'+(m==='ok'?'checked':'read with care')+'</span>'+(v.caveat?'<br><small>'+esc(v.caveat)+'</small>':'')+'</p></div>'}).join('')+'</div>'+
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

function hoursOfWork(t,c,box){var st={people:c.people||4,rides:c.rides||44,rent:{},pay:{},custom:{}};
  c.places.forEach(function(p){if(p.rent&&p.rent.amt==null)st.rent[p.id]=p.rent.guess;st.pay[p.id]=0;var cu=p.pays.filter(function(x){return x.custom})[0];if(cu)st.custom[p.id]=cu.def});
  function payOf(p){var o=p.pays[st.pay[p.id]];return {o:o,monthly:o.custom?st.custom[p.id]:o.monthly}}
  function draw(){var R=c.places.map(function(p){var P=payOf(p),hourly=P.monthly/p.month,rent=!p.rent?0:p.rent.amt!=null?p.rent.amt:st.rent[p.id],
      it=[{k:'food',lab:p.food.lab||'Food for the household',cost:p.food.hh!=null?p.food.hh:p.food.pp*st.people}];if(p.rent)it.push({k:'rent',lab:'Rent',cost:rent});if(p.bus)it.push({k:'bus',lab:'Bus rides',cost:p.bus.fare*st.rides});
      it.forEach(function(x){x.h=hourly>0?x.cost/hourly:0});var cost=it.reduce(function(a,b){return a+b.cost},0);
      return {p:p,P:P,it:it,cost:cost,tot:hourly>0?cost/hourly:0,share:P.monthly>0?cost/P.monthly:0}}),
      max=Math.max.apply(null,R.map(function(r){return Math.max(r.tot,r.p.month)}));
    box.innerHTML='<div class="sec"><div class="sliders"><label>People in the household: <b>'+st.people+'</b><input type="range" min="1" max="8" value="'+st.people+'" data-hw="people"></label>'+
      '<label>Bus rides a month: <b>'+st.rides+'</b><input type="range" min="0" max="120" value="'+st.rides+'" data-hw="rides"></label>'+
      c.places.filter(function(p){return p.rent&&p.rent.amt==null}).map(function(p){return '<label>'+esc(p.rent.label)+': <b>'+p.cur+fmt(st.rent[p.id])+'</b><input type="range" min="'+p.rent.min+'" max="'+p.rent.max+'" step="'+p.rent.step+'" value="'+st.rent[p.id]+'" data-rent="'+p.id+'"></label><p class="muted" style="font-size:14px">'+esc(p.rent.note)+'</p>'}).join('')+
      '</div></div>'+
      R.map(function(r){var p=r.p,o=r.P.o,whole=o.household;return '<div class="fam"><h4>'+esc(p.label)+'</h4>'+
        '<label class="sl">Whose pay? <select data-pay="'+p.id+'">'+p.pays.map(function(x,i){return '<option value="'+i+'"'+(i===st.pay[p.id]?' selected':'')+'>'+esc(x.label)+'</option>'}).join('')+'</select></label>'+
        (o.custom?'<label class="sl">Monthly pay: <b>'+p.cur+fmt(st.custom[p.id])+'</b><input type="range" min="'+o.min+'" max="'+o.max+'" step="'+o.step+'" value="'+st.custom[p.id]+'" data-cu="'+p.id+'"></label>':'')+
        '<p class="muted" style="font-size:14px">'+esc(o.note||'')+(o.src?' <small>Source: '+srcLink(o)+'</small>':'')+(o.mark==='care'?' <span class="pill care">read with care</span>':'')+'</p>'+
        '<div class="stack hw" role="img" aria-label="'+esc(p.label)+': '+fmt(r.tot)+' hours of work a month">'+r.it.map(function(x){return '<span class="sg '+({food:'leave',rent:'gap',bus:'sav'})[x.k]+'" style="width:'+(x.h/max*100)+'%"></span>'}).join('')+'<i class="mark" style="left:'+(p.month/max*100)+'%"></i></div>'+
        '<p class="fsum">'+r.it.map(function(x){return x.k==='food'?(p.food.short||'Food'):x.k}).join(', ').replace(/, ([^,]*)$/,' and $1').replace(/^./,function(a){return a.toUpperCase()})+(r.it.length>1?' cost':' costs')+' <b>'+p.cur+fmt(r.cost)+'</b> a month: <b>'+fmt(r.share*100)+'%</b> of '+(whole?'what the whole family earns':'this pay')+'. '+
          (whole?(r.share>1?'The family is short <b>'+p.cur+fmt(r.cost-r.P.monthly)+'</b> every month before anything else: clothes, school, a doctor.':'What is left for everything else: <b>'+p.cur+fmt(r.P.monthly-r.cost)+'</b>.'):
          'At this pay that is <b>'+fmt(r.tot)+' hours</b> of work, or <b>'+fmt(r.share,1)+'</b> full-time '+(r.share>=1.05?'earners':'earner')+'.')+'</p>'+
        (p.line&&whole?'<p class="fsum">Per person: <b>'+p.cur+fmt(r.P.monthly/st.people)+'</b> a month. '+esc(p.line.text)+' <small>Source: '+srcLink(p.line)+'</small></p>':'')+'<ul class="cus">'+r.it.map(function(x){var src=x.k==='food'?p.food:x.k==='rent'?p.rent:p.bus;return '<li><b>'+x.lab+'</b>: '+p.cur+fmt(x.cost)+'. '+esc(src.text||'')+' <small>Source: '+srcLink(src)+'</small></li>'}).join('')+'</ul></div>'}).join('')+
      '<p class="legend"><span class="sg leave"></span> food <span class="sg gap"></span> rent <span class="sg sav"></span> bus <i class="mark inline"></i> one full-time month at the chosen pay</p>';
    box.querySelectorAll('[data-hw]').forEach(function(r){r.oninput=function(){st[r.dataset.hw]=+r.value;draw();box.querySelector('[data-hw="'+r.dataset.hw+'"]').focus()}});
    box.querySelectorAll('[data-rent]').forEach(function(r){r.oninput=function(){st.rent[r.dataset.rent]=+r.value;draw();box.querySelector('[data-rent="'+r.dataset.rent+'"]').focus()}});
    box.querySelectorAll('[data-cu]').forEach(function(r){r.oninput=function(){st.custom[r.dataset.cu]=+r.value;draw();box.querySelector('[data-cu="'+r.dataset.cu+'"]').focus()}});
    box.querySelectorAll('[data-pay]').forEach(function(r){r.onchange=function(){st.pay[r.dataset.pay]=+r.value;draw();box.querySelector('[data-pay="'+r.dataset.pay+'"]').focus()}})}
  draw()}

function noFloor(t,c,box){var P=c.piece,M=c.month,G=c.grid,EV=c.events,
  st={g:{},shown:false,opt:0,price:P.options[0].price,pace:P.pace.def,hrs:(P.hours||{def:8}).def,cost:P.cost?P.cost.def:0,monthly:M.pay.monthly,ev:{}};
  function yn(v){return v===true?'<span class="pill yes">Yes</span>':v===false?'<span class="pill no">No</span>':'<span class="pill care">'+esc(v)+'</span>'}
  function cell(x){return yn(x.v)+(x.text?' <span class="muted">'+esc(x.text)+'</span>':'')+(x.src?' <small>Source: '+srcLink(x)+'</small>':'')}
  function draw(){var right=0,asked=0;
    // ---- part 1: the guess
    var h='<div class="sec"><h3>1 · What does the work come with?</h3><p>'+esc(c.guessIntro)+'</p>'+
      '<div class="rates">'+c.rates.map(function(r){return '<p><b>'+esc(r.big)+'</b> '+esc(r.text)+' <small>Source: '+srcLink(r)+'</small>'+(r.mark==='care'?' <span class="pill care">read with care</span>':'')+'</p>'}).join('')+'</div>'+
      '<ol class="nf">'+G.rows.map(function(r,i){var g=st.g[i];if(g!=null){asked++;if(g===r.here.v)right++}
        return '<li><p><b>'+esc(r.q)+'</b></p>'+
          (st.shown?'':'<div class="wq"><span class="muted">'+esc(c.hereLabel)+':</span> <button data-g="'+i+'" data-v="1" class="'+(g===true?'on':'')+'">Yes</button> <button data-g="'+i+'" data-v="0" class="'+(g===false?'on':'')+'">No</button></div>')+
          (st.shown?'<ul class="cus nfa"><li><b>'+esc(c.hereLabel)+'</b>: '+cell(r.here)+(g!=null?(g===r.here.v?' <span class="pill yes">you got it</span>':' <span class="pill no">you guessed '+(g?'yes':'no')+'</span>'):'')+'</li>'+
            '<li><b>A Denver job with a payslip</b>: '+cell(r.w2)+'</li><li><b>Cash or day work in Denver</b>: '+cell(r.cash)+'</li></ul>':'')+'</li>'}).join('')+'</ol>'+
      (st.shown?'<p class="fsum">You guessed <b>'+right+' of '+asked+'</b> right. '+esc(G.after)+' <small>Source: '+srcLink(G.def)+'</small></p>':'<p><button class="btn" data-show>Show the answers</button> <span class="muted">('+asked+' of '+G.rows.length+' guessed)</span></p>')+'</div>';
    // ---- part 2: by the piece
    var o=P.options[st.opt],rate=P.pace.inv?1/(st.pace||1):st.pace,perHour=st.price*rate-(st.cost/(st.hrs||1)),day=perHour*st.hrs,mon=day*(P.days||26),need=P.minHour>0&&st.price>0?(P.minHour+st.cost/(st.hrs||1))/st.price:0,needPrice=(P.minHour+st.cost/(st.hrs||1))/(rate||1);
    h+='<div class="sec"><h3>2 · Paid by the piece</h3><p>'+esc(P.intro)+'</p><div class="sliders">'+
      (P.options.length>1?'<label class="sl">'+esc(P.optLabel||'What is sold')+': <select data-opt>'+P.options.map(function(x,i){return '<option value="'+i+'"'+(i===st.opt?' selected':'')+'>'+esc(x.label)+'</option>'}).join('')+'</select></label>':'')+
      '<p class="muted" style="font-size:14px">'+esc(o.text)+(o.src?' <small>Source: '+srcLink(o)+'</small>':'')+(o.mark==='care'?' <span class="pill care">read with care</span>':o.mark==='yours'?' <span class="pill care">your estimate</span>':'')+'</p>'+
      '<label>Price for one '+esc(P.unit)+': <b>'+P.cur+fmt(st.price,2)+'</b><input type="range" min="'+P.price.min+'" max="'+P.price.max+'" step="'+P.price.step+'" value="'+st.price+'" data-nf="price"></label>'+
      '<label>'+esc(P.pace.label)+': <b>'+fmt(st.pace,2)+'</b><input type="range" min="'+P.pace.min+'" max="'+P.pace.max+'" step="'+P.pace.step+'" value="'+st.pace+'" data-nf="pace"></label><p class="muted" style="font-size:14px">'+esc(P.pace.note)+'</p>'+
      '<label>Hours of work a day: <b>'+st.hrs+'</b><input type="range" min="1" max="14" step="1" value="'+st.hrs+'" data-nf="hrs"></label>'+
      (P.cost?'<label>'+esc(P.cost.label)+': <b>'+P.cur+fmt(st.cost)+'</b><input type="range" min="'+P.cost.min+'" max="'+P.cost.max+'" step="'+P.cost.step+'" value="'+st.cost+'" data-nf="cost"></label><p class="muted" style="font-size:14px">'+esc(P.cost.note)+(P.cost.src?' <small>Source: '+srcLink(P.cost)+'</small>':'')+'</p>':'')+
      '</div><p class="fsum">That is <b>'+P.cur+fmt(perHour,2)+' an hour</b>, '+P.cur+fmt(day)+' a day, about <b>'+P.cur+fmt(mon)+'</b> a month of '+(P.days||26)+' working days (our arithmetic). '+
      (P.minHour?'The minimum wage works out to '+P.cur+fmt(P.minHour,2)+' an hour ('+esc(P.minText)+'). '+(perHour>=P.minHour?'At this pace and price the work beats the minimum, on the days it happens.':(P.pace.inv?'To reach it, one '+esc(P.unit)+' would have to take no more than <b>'+fmt(st.price/(P.minHour||1),1)+' hours</b>, or sell for <b>'+P.cur+fmt(needPrice)+'</b>.':'To reach it you would need <b>'+fmt(need,1)+' '+esc(P.units)+' an hour</b>, or a price of <b>'+P.cur+fmt(needPrice,2)+'</b> each.')):'')+'</p>'+
      '<p class="muted">'+esc(P.after)+'</p></div>';
    // ---- part 3: a month
    var daily=st.monthly/(M.days||26),denDay=19.29*8,bank=6,lostI=0,lostW=0,lostC=0,rows=[];
    EV.forEach(function(e,i){if(!st.ev[i])return;var d=e.days;lostI+=d*daily;lostC+=d*denDay;var w=0,how;
      if(e.hfwa){var use=Math.min(bank,d);bank-=use;var rest=d-use;w=rest*denDay*(e.famli?0.1:1);how=use?'Colorado paid sick leave covers '+use+' day'+(use>1?'s':'')+(rest?(e.famli?'; FAMLI pays about 90% of the rest':'; the rest is unpaid'):''):(e.famli?'Paid sick leave is used up; FAMLI pays about 90%':'Paid sick leave is used up: unpaid')}
      else{w=d*denDay;how=e.w2}
      lostW+=w;rows.push('<li><b>'+esc(e.label)+'</b>. Here: '+M.cur+fmt(d*daily)+' gone. Denver payslip job: '+esc(how)+'. Denver cash work: gone.</li>')});
    var denMon=denDay*26,sh=[['here',c.hereLabel,lostI/st.monthly],['w2','A Denver job with a payslip, at the minimum',lostW/denMon],['cash','Cash or day work in Denver, at the minimum',lostC/denMon]];
    h+='<div class="sec"><h3>3 · A month with no floor</h3><p>'+esc(M.intro)+'</p><div class="sliders"><label>A month of pay here: <b>'+M.cur+fmt(st.monthly)+'</b><input type="range" min="'+M.pay.min+'" max="'+M.pay.max+'" step="'+M.pay.step+'" value="'+st.monthly+'" data-nf="monthly"></label>'+
      '<p class="muted" style="font-size:14px">'+esc(M.pay.text)+' <small>Source: '+srcLink(M.pay)+'</small>'+(M.pay.mark==='care'?' <span class="pill care">read with care</span>':'')+' That is about '+M.cur+fmt(daily)+' for each of '+(M.days||26)+' working days (our arithmetic).</p></div>'+
      '<p><b>What happens this month?</b></p><div class="wq">'+EV.map(function(e,i){return '<button data-ev="'+i+'" class="'+(st.ev[i]?'on':'')+'">'+esc(e.label)+'</button>'}).join(' ')+'</div>'+
      sh.map(function(x){return '<div class="fam"><h4>'+esc(x[1])+'</h4><div class="stack hw"><span class="sg gap" style="width:'+Math.min(100,x[2]*100)+'%"></span></div><p class="fsum"><b>'+fmt(x[2]*100)+'%</b> of the month\'s pay lost.</p></div>'}).join('')+
      (rows.length?'<ul class="cus">'+rows.join('')+'</ul>':'<p class="muted">Pick what happens to see who still gets paid.</p>')+
      '<p class="muted" style="font-size:14px">Denver: '+esc(M.denNote)+' <small>Source: '+srcLink(M.den)+'</small></p>'+
      '<p><b>What families here do instead.</b> '+esc(c.doing.text)+' <small>Source: '+esc(c.doing.src)+'</small></p></div>';
    box.innerHTML=h;
    box.querySelectorAll('[data-g]').forEach(function(b){b.onclick=function(){st.g[b.dataset.g]=b.dataset.v==='1';draw()}});
    var sb=box.querySelector('[data-show]');if(sb)sb.onclick=function(){st.shown=true;draw()};
    var so=box.querySelector('[data-opt]');if(so)so.onchange=function(){st.opt=+so.value;st.price=P.options[st.opt].price;draw();box.querySelector('[data-opt]').focus()};
    box.querySelectorAll('[data-nf]').forEach(function(r){r.oninput=function(){st[r.dataset.nf]=+r.value;draw();box.querySelector('[data-nf="'+r.dataset.nf+'"]').focus()}});
    box.querySelectorAll('[data-ev]').forEach(function(b){b.onclick=function(){st.ev[b.dataset.ev]=!st.ev[b.dataset.ev];draw();box.querySelector('[data-ev="'+b.dataset.ev+'"]').focus()}})}
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
/* ---------- pictures: one comparison per barrier, guess first (data in pictures.js) ---------- */
var PICS=window.PICS||{};
function bare(s){return String(s||'').replace(/\*/g,'')}
function cap(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1)}
function first(s){s=bare(s).replace(/✅|⚠️?/g,'').replace(/\(\s*[;,]?\s*\)/g,'').replace(/\s+\)/g,')').replace(/\(\s+/g,'(').replace(/\s{2,}/g,' ');var m=s.match(/^(.{40,}?[a-z\)\d]{2,}[.!?])(?=\s+[A-Z“*(]|\s*$)/);return m?m[1]:s}
function picsOf(t,i){var b=t.barriers[i];return b?((PICS[t.id]||{})[i+1]||[]).filter(function(p){return bare(b.title).indexOf(bare(p.b))===0}):[]}
function allPics(t){var out=[];t.barriers.forEach(function(b,i){picsOf(t,i).forEach(function(p,k){out.push({bi:i,k:k,p:p})})});
  var L=out.filter(function(x){return x.p.lead})[0];if(L){out.splice(out.indexOf(L),1);out.unshift(L)}return out}
function dec(p){var d=0;p.rows.forEach(function(r){var s=String(r[1]),i=s.indexOf('.');if(i>=0)d=Math.max(d,s.length-i-1)});if(p.pre&&d===1)d=2;return Math.min(d,2)}
function val(p,v,d){var s=fmt(v,d==null?dec(p):d);return p.pre?p.u+s:s+(p.u||'')}
function nice(x){var e=Math.pow(10,Math.floor(Math.log(x)/Math.LN10)),m=x/e,S=[1,1.5,2,2.5,3,4,5,6,8,10],i=0;while(S[i]<m-1e-9)i++;return S[i]*e}
function axis(p){var mx=Math.max.apply(null,p.rows.map(function(r){return r[1]}));
  if(p.k==='dots')return p.of||100;if(p.u==='%'&&mx>40&&mx<=100)return 100;return nice(mx*1.15)}
function gstep(p,ax){if(p.k==='dots')return 1;var d=dec(p),s=nice(ax/200);return d===0?Math.max(1,Math.round(s)):s}
function dgrid(tot,n,ghost,mark){var s='';for(var i=0;i<tot;i++)s+='<i class="'+(i<n?'on':'')+(mark!=null&&i===mark-1?' gm':'')+'"></i>';return '<div class="dgrid'+(tot!==100?' few':'')+'">'+s+'</div>'}
var SEG=['var(--rj)','#1565c0','#2e7d32','#d08a2c','#6a1b9a'];
function picSrc(t,b,p,inBar){var out=[];p.s.forEach(function(s){var x;
    if(s==='d')x='Denver and Colorado figures: '+(inBar?'see “The same structure in Denver” on this page.':'see the Denver note on the barrier page.');
    else{var n=b.numbers[+s.slice(1)];if(!n)return;var u=srcUrl(t,n.src);
      x=(n.src?md(n.src):'This barrier’s number list')+' '+(n.mark==='care'?'<span class="pill care" title="Not double-checked against the original source">read with care</span>':'<span class="pill ok">checked</span>')+(u?' · <a href="'+esc(u)+'" target="_blank" rel="noopener">Check it yourself</a>':'')}
    if(out.indexOf(x)<0)out.push(x)});
  var named=out.filter(function(x){return x.indexOf('This barrier’s number list')!==0});if(named.length)out=named;
  return '<div class="psrc"><b>Source:</b> '+out.join('<br>')+'</div>'}
/* g: '' = not shown yet, '-' = shown without a guess, a number = the guess */
function picHTML(t,bi,k,p,g,inBar){
  var b=t.barriers[bi],ax=axis(p),d=dec(p),xi=-1;p.rows.forEach(function(r,i){if(r[2]==='x')xi=i});
  var canGuess=xi>=0&&p.k!=='split',open=!canGuess||g!=='',gn=g!==''&&g!=='-'?+g:null,id=t.id+':'+(bi+1)+':'+k;
  var h='<figure class="pic k-'+p.k+(open?' open':'')+'" data-pic="'+id+'"><figcaption>'+md(p.t)+'</figcaption>';
  if(p.k==='split'){var sum=p.rows.reduce(function(a,r){return a+r[1]},0),rows=p.rows.slice();if(sum<99.5)rows.push(['Not listed here',Math.round((100-sum)*10)/10,'o']);
    h+='<div class="split" role="img" aria-label="'+esc(rows.map(function(r){return r[0]+' '+r[1]+'%'}).join(', '))+'">'+rows.map(function(r,i){return '<span style="width:'+r[1]+'%;background:'+(r[2]==='o'?'var(--line)':SEG[i%SEG.length])+'"></span>'}).join('')+'</div>'+
      '<ul class="sleg">'+rows.map(function(r,i){return '<li><i style="background:'+(r[2]==='o'?'var(--line)':SEG[i%SEG.length])+'"></i><b>'+val(p,r[1],r[2]==='o'?1:null)+'</b> '+esc(r[0])+'</li>'}).join('')+'</ul>';
  }else{
    h+='<div class="prs">'+p.rows.map(function(r,i){var me=i===xi,hid=me&&!open,tot=p.of||100;
      return '<div class="pr'+(me?' hi':'')+(r[2]==='h'?' home':'')+'"><div class="pl">'+esc(r[0])+(r[2]==='h'?' <span class="tag">home</span>':'')+'</div>'+
        (p.k==='dots'?'<div class="pd">'+dgrid(tot,hid?0:Math.round(r[1]),0,me&&open?gn:null)+'<b class="pval">'+(hid?'?':val(p,r[1],d)+(p.of?' of '+p.of:''))+'</b></div>'
          :'<div class="pt"><span class="pb" style="width:'+(hid?0:r[1]/ax*100)+'%"></span>'+(hid?'<span class="pb ghost" style="width:0%"></span>':'')+(me&&open&&gn!=null?'<i class="gm" style="left:'+Math.min(100,gn/ax*100)+'%"></i>':'')+'<b class="pval">'+(hid?'?':val(p,r[1],d))+'</b></div>')+
        (hid?'<div class="pg"><label><span>Drag to guess: <b data-gv>?</b></span><input type="range" min="0" max="'+ax+'" step="'+gstep(p,ax)+'" value="0" aria-label="Your guess for '+esc(r[0])+'"></label><button class="btn" data-show>Show it</button></div>':'')+'</div>'}).join('')+'</div>';
  }
  if(open)h+='<p class="psay">'+md(p.say)+'</p>'+
    (gn!=null?'<p class="pgs">Your guess: <b>'+val(p,gn,d)+'</b>. The number: <b>'+val(p,p.rows[xi][1],d)+'</b>. <button class="linkish" data-again>Guess again</button></p>':'')+picSrc(t,b,p,inBar);
  return h+'</figure>'}
function wirePics(root,t,inBar){root.querySelectorAll('figure[data-pic]').forEach(function(f){
  var a=f.dataset.pic.split(':'),bi=+a[1]-1,k=+a[2],p=picsOf(t,bi)[k];if(!p)return;var ax=axis(p),r=f.querySelector('input[type=range]'),moved=false;
  function swap(g,from){var tmp=document.createElement('div');tmp.innerHTML=picHTML(t,bi,k,p,g,inBar);var nf=tmp.firstChild;f.parentNode.replaceChild(nf,f);
    var hb=nf.querySelector('.hi .pb');if(hb&&from!=null&&window.requestAnimationFrame){var w=hb.style.width;hb.style.width=from+'%';requestAnimationFrame(function(){requestAnimationFrame(function(){hb.style.width=w})})}
    wirePics(nf.parentNode,t,inBar)}
  if(r){r.oninput=function(){moved=true;var g=+r.value;f.querySelector('[data-gv]').textContent=val(p,g)+(p.of?' of '+p.of:'');
      var gb=f.querySelector('.pb.ghost');if(gb)gb.style.width=(g/ax*100)+'%';
      f.querySelectorAll('.hi .dgrid i').forEach(function(x,i){x.className=i<g?'gh':''})};
    f.querySelector('[data-show]').onclick=function(){var g=moved?String(+r.value):'-';store('pic:'+f.dataset.pic,g);swap(g,moved?+r.value/ax*100:0)}}
  var ag=f.querySelector('[data-again]');if(ag)ag.onclick=function(){store('pic:'+f.dataset.pic,'');swap('',null)}})}
function picsHTML(t,i,inBar){return picsOf(t,i).map(function(p,k){return picHTML(t,i,k,p,store('pic:'+t.id+':'+(i+1)+':'+k),inBar)}).join('')}

/* ---------- See it: the pictures one at a time ---------- */
function see(t,p,sub){var F=allPics(t);if(!F.length){over(t,p);return}
  var i=sub==null?0:Math.max(0,Math.min(F.length,sub));
  var steps='<div class="steps" role="navigation" aria-label="Pictures">'+F.map(function(x,k){return '<a href="#'+t.id+'/see/'+(k+1)+'" class="'+(k===i?'on':k<i?'done':'')+'" aria-label="Picture '+(k+1)+'"'+(k===i?' aria-current="step"':'')+'></a>'}).join('')+
    '<a href="#'+t.id+'/see/'+(F.length+1)+'" class="end'+(i===F.length?' on':'')+'" aria-label="How it stacks up"></a></div>';
  if(i<F.length){var x=F[i],b=t.barriers[x.bi];
    p.innerHTML=(i===0?'<p class="lede">Before the reading, look. Each picture is one real comparison. Guess first, then see it.</p>':'')+steps+
     '<div class="frame"><p class="kick">Picture '+(i+1)+' of '+F.length+'</p><h3 style="margin-top:0">'+md(b.title)+'</h3>'+
     (b.oneDay?'<div class="oneday"><b>One day:</b> '+md(cap(b.oneDay))+'</div>':b.plain?'<p>'+md(first(b.plain))+'</p>':'')+
     picHTML(t,x.bi,x.k,x.p,store('pic:'+t.id+':'+(x.bi+1)+':'+x.k),false)+
     '<p class="seenav"><a class="btn ghost" href="#'+t.id+'/bar/'+(x.bi+1)+'">Why is it like this?</a> <a class="btn" href="#'+t.id+'/see/'+(i+2)+'">'+(i<F.length-1?'Next picture →':'How it stacks up →')+'</a></p></div>';
    wirePics(p,t,false)}
  else p.innerHTML=steps+'<div class="frame"><p class="kick">All '+F.length+' pictures</p><h3 style="margin-top:0">How it stacks up</h3>'+
     (t.web?'<div class="claim">'+md(t.web)+'</div>':'')+
     '<p>No picture here is the whole story of anyone you will meet. Two questions are left: why it is like this, and what would actually help.</p>'+
     '<p class="seenav"><a class="btn ghost" href="#'+t.id+'/bar">Why: the barriers →</a> <a class="btn" href="#'+t.id+'/act">What would actually help? →</a></p></div>'}

/* ---------- Respond: help today, change the rule, stand with ---------- */
var LANES=[['help','Help today','Meet the need in front of you.'],['rule','Change the rule','Change what it costs everyone.'],['with','Stand with','Join the people already working on it.']];
function hrs(t,key){var s=store('hrs:'+t.id+':'+key).split(',').map(Number);return s.length===3&&!s.some(isNaN)?s:[0,0,0]}
function hoursHTML(t,key,ask,why){var v=hrs(t,key),left=10-v[0]-v[1]-v[2];
  return '<div class="act3" data-hrs="'+key+'"><p>'+ask+' Tap <b>+</b> to place your <b>10 blocks of time</b>.</p><div class="lanes">'+LANES.map(function(L,k){var bl='';for(var j=0;j<v[k];j++)bl+='<i></i>';
     return '<div class="lane '+L[0]+'"><b>'+L[1]+'</b><span>'+L[2]+'</span><div class="blk" role="img" aria-label="'+v[k]+' blocks">'+bl+'</div>'+
      '<div class="pm"><button data-m="'+k+'" aria-label="One less for '+L[1]+'"'+(v[k]<=0?' disabled':'')+'>−</button><b>'+v[k]+'</b><button data-p="'+k+'" aria-label="One more for '+L[1]+'"'+(left<=0?' disabled':'')+'>+</button></div></div>'}).join('')+'</div>'+
   '<p class="muted" data-copyline>'+(left>0?left+' of 10 blocks left to place.':'My 10 blocks: help today '+v[0]+', change the rule '+v[1]+', stand with '+v[2]+'.')+'</p>'+
   (left===0&&why?answerBox(t.id+':hrswhy:'+key,why):'')+'</div>'}
function wireHours(root,t,after){root.querySelectorAll('[data-hrs]').forEach(function(box){var key=box.dataset.hrs;
  box.querySelectorAll('[data-p],[data-m]').forEach(function(b){b.onclick=function(){var v=hrs(t,key),k=+(b.dataset.p||b.dataset.m);v[k]+=b.dataset.p?1:-1;
    if(v[k]<0||v[0]+v[1]+v[2]>10)return;store('hrs:'+t.id+':'+key,v.join(','));after(key,b.dataset.p?'p':'m',k)}})})}
function mix(v,label){var s=v[0]+v[1]+v[2];return '<div class="mixrow"><span>'+esc(label)+'</span>'+(s?'<div class="mix" role="img" aria-label="'+esc(label)+': help today '+v[0]+', change the rule '+v[1]+', stand with '+v[2]+'">'+LANES.map(function(L,k){return '<i class="'+L[0]+'" style="width:'+(v[k]/s*100)+'%">'+(v[k]/s>=.12?Math.round(v[k]/s*100)+'%':'')+'</i>'}).join('')+'</div>':'<div class="mix none">not placed yet</div>')+'</div>'}
var WAYS=[['help','Help today','Someone is hungry tonight, and you bring food. The Church calls these the works of mercy.','Tomorrow, food costs what it cost today.',
   '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 26h32c0 9-7 14-16 14S8 35 8 26z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M18 20c-2-3 2-5 0-8M24 20c-2-3 2-5 0-8M30 20c-2-3 2-5 0-8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'],
  ['rule','Change the rule','Ask who decided what this costs here, and work to change the decision. The Church calls this justice.','It is slow, and it feeds no one tonight.',
   '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8v32M12 40h24M10 14h28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M10 14l-6 12a6 6 0 0012 0zM38 14l-6 12a6 6 0 0012 0z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>'],
  ['with','Stand with','People here are already working on it. Learn their names, follow their lead, and stay in it after you fly home. The Church calls this solidarity.','It costs you something: time, comfort, and being the one who does not lead.',
   '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="16" cy="13" r="5" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="32" cy="13" r="5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M6 40V30a10 10 0 0118-6 10 10 0 0118 6v10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>']];
function respond(t,p){var th=t.theology||{readings:[]},n=0,sum=[0,0,0];
  t.barriers.forEach(function(b,i){var v=hrs(t,i);if(v[0]+v[1]+v[2]===10){n++;sum[0]+=v[0];sum[1]+=v[1];sum[2]+=v[2]}});
  var wk=hrs(t,'week'),doing=t.barriers.map(function(b,i){return b.doing?'<li><a href="#'+t.id+'/bar/'+(i+1)+'">'+md(bare(b.title).split(/ [—:] | — /)[0])+'</a><span>'+md(first(b.doing))+'</span></li>':''}).join('');
  p.innerHTML='<p class="lede">Seeing a barrier is not the end. There are three ways to respond. All three are needed, and they are not the same thing.</p>'+
   '<div class="ways">'+WAYS.map(function(w){return '<div class="way '+w[0]+'">'+w[4]+'<h3>'+w[1]+'</h3><p>'+w[2]+'</p><p class="cant"><b>What it cannot do:</b> '+w[3]+'</p></div>'}).join('')+'</div>'+
   '<div class="sec"><h3>Where does a week like yours go?</h3>'+hoursHTML(t,'week','Think about what your group will actually do this week.','')+'</div>'+
   '<div class="sec"><h3>Your week, and what you would do</h3><p class="muted">On each barrier page you place 10 blocks. They add up here.</p>'+mix(wk,'The week we have')+mix(sum,n?'What I would do, across '+n+' barrier'+(n>1?'s':''):'What I would do')+
     '<p class="legend"><span class="sg lhelp"></span> help today <span class="sg lrule"></span> change the rule <span class="sg lwith"></span> stand with</p>'+
     answerBox(t.id+':act:gap','Look at the two bars. Where is the biggest gap, and what is one thing you could do from Denver about it?')+'</div>'+
   (doing?'<div class="sec"><h3>Who is already at work here</h3><p class="muted">Solidarity starts with knowing who these people are.</p><ul class="work">'+doing+'</ul></div>':'')+
   '<div class="sec"><h3>What the Church means by these words</h3><ul class="read">'+
    '<li><b>Mercy and justice are two different feet.</b> Meeting a need today and changing what causes it are both required, and neither replaces the other. <a href="https://www.usccb.org/twofeet" target="_blank" rel="noopener">U.S. bishops, Two Feet of Love in Action</a>.</li>'+
    '<li><b>Some help is a debt, not a gift.</b> When people lack what they need to live, giving it to them is first a matter of justice. <a href="https://www.vatican.va/archive/ENG0015/_INDEX.HTM" target="_blank" rel="noopener">Catechism of the Catholic Church</a>, 2443 to 2449.</li>'+
    '<li><b>Solidarity is not a feeling.</b> It is a steady decision to work for the good of everyone, because we are responsible for one another. <a href="https://www.vatican.va/content/john-paul-ii/en/encyclicals/documents/hf_jp-ii_enc_30121987_sollicitudo-rei-socialis.html" target="_blank" rel="noopener">John Paul II, Sollicitudo Rei Socialis</a>, 38; Catechism 1939 to 1942.</li>'+
    '<li><b>Solidarity goes to the causes.</b> It includes working against the structures that keep people poor. <a href="https://www.vatican.va/content/francesco/en/encyclicals/documents/papa-francesco_20201003_enciclica-fratelli-tutti.html" target="_blank" rel="noopener">Francis, Fratelli Tutti</a>, 116.</li>'+
    '<li><b>Love is still needed in a just society.</b> Building fair structures is the work of politics; no structure removes the need for someone to show up. <a href="https://www.vatican.va/content/benedict-xvi/en/encyclicals/documents/hf_ben-xvi_enc_20051225_deus-caritas-est.html" target="_blank" rel="noopener">Benedict XVI, Deus Caritas Est</a>, 28.</li></ul></div>'+
   (th.readings.length?'<div class="sec"><h3>For this place</h3><ul class="read">'+th.readings.map(function(r){return '<li>'+md(r)+'</li>'}).join('')+'</ul>'+
     (th.question?'<div class="claim"><b>Carry this question:</b> '+md(th.question)+'</div>'+answerBox(t.id+':faith',th.question):'')+'</div>':'')+copyBtn('act');
  wireHours(p,t,function(key,dir,k){respond(t,p);wireAnswers(p);wireCopy(p,t.name+' · Respond');var b=p.querySelector('[data-hrs="'+key+'"] [data-'+dir+'="'+k+'"]');if(b&&!b.disabled)b.focus()})}

function before(t,p){
  p.innerHTML='<h3>The fences in us</h3><p class="lede">What keeps us from seeing this place clearly. Open each one. Mark the ones that are yours.</p><div class="fences">'+
   (t.fences||[]).map(function(f,i){var k=t.id+':fence:'+i,on=store(k)==='1';return '<details class="fence'+(on?' mine':'')+'"><summary><b>'+md(f.h)+'</b></summary><p>'+md(f.text)+'</p><label class="chk"><input type="checkbox" data-fence="'+k+'" data-h="'+esc(bare(f.h))+'"'+(on?' checked':'')+'> This one is mine</label></details>'}).join('')+'</div><p class="muted" data-copyline id="fmine"></p>'+
   (t.carry||[]).map(function(c){return '<h3>'+md(c.h.replace(/\s*\(.*\)/,''))+'</h3><ul>'+c.items.map(function(i){return '<li>'+md(i)+'</li>'}).join('')+'</ul>'}).join('')+
   '<h3>Before you go</h3><p class="muted">Your answers stay on this device.</p>'+(window.BEFORE||[]).map(function(q,i){return answerBox(t.id+':before:'+i,(i+1)+'. '+q)}).join('')+copyBtn('before');
  function mine(){var L=[];p.querySelectorAll('[data-fence]').forEach(function(c){if(c.checked)L.push(c.dataset.h)});var o=$('#fmine',p);if(o)o.textContent=L.length?'Fences I marked as mine: '+L.join('; ')+'.':''}
  p.querySelectorAll('[data-fence]').forEach(function(c){c.onchange=function(){store(c.dataset.fence,c.checked?'1':'0');c.closest('.fence').classList.toggle('mine',c.checked);mine()}});mine();
  if(t.beforeExtra)t.beforeExtra(p)}
function after(t,p){p.innerHTML='<p class="lede">Do these in the first week home. Your answers stay on this device.</p>'+(window.AFTER||[]).map(function(q,i){return answerBox(t.id+':after:'+i,(i+1)+'. '+q)}).join('')+copyBtn('after')}
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
  if(h[0]==='family'&&window.FAMILY_PAGE){window.FAMILY_PAGE();return true}
  if(h[0]==='rules'&&window.RULES_PAGE){window.RULES_PAGE();return true}
  if(h[0]==='road'&&window.ROAD_PAGE){window.ROAD_PAGE();return true}
  var t=T[h[0]];if(!t||t.status!=='public')return false;
  var sub=h[2];if((h[1]==='bar'||h[1]==='see')&&sub!=null){sub=parseInt(sub,10)-1;if(isNaN(sub))sub=null}
  page(t,h[1],sub==null?null:sub);return true};
})();
