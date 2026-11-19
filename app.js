(function(){'use strict';
var IMM=window.IMM,D=window.DENVER,$=function(s){return document.querySelector(s)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function miles(a){var R=3958.8,r=Math.PI/180,dl=(a.lat-D.lat)*r,dn=(a.lon-D.lon)*r,
  h=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(D.lat*r)*Math.cos(a.lat*r)*Math.sin(dn/2)*Math.sin(dn/2);return Math.round(2*R*Math.asin(Math.sqrt(h))/10)*10}
function fmt(n){return n.toLocaleString('en-US')}
function store(k,v){try{if(v===undefined)return localStorage.getItem('imm:'+k)||'';localStorage.setItem('imm:'+k,v)}catch(e){return ''}}
var app=$('#app');

/* Altitude chart: every site against Denver's mile-high line */
function altChart(list,hi){
  var nar=(window.innerWidth||800)<560,w=nar?400:640,row=30,top=10,h=top+list.length*row+34,x0=nar?128:150,x1=w-(nar?58:70),max=11000;
  var X=function(f){return x0+(x1-x0)*f/max};
  var s='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Altitude of each immersion site compared with Denver">';
  for(var g=0;g<=10000;g+=(nar?5000:2500))s+='<line x1="'+X(g)+'" x2="'+X(g)+'" y1="'+top+'" y2="'+(h-26)+'" stroke="var(--g-grid)"/><text x="'+X(g)+'" y="'+(h-10)+'" font-size="12" text-anchor="middle" fill="var(--muted)">'+fmt(g)+' ft</text>';
  list.forEach(function(p,i){var y=top+i*row,me=hi&&p.id===hi;
    s+='<text x="'+(x0-8)+'" y="'+(y+19)+'" font-size="14" text-anchor="end" font-weight="'+(me?700:400)+'">'+esc(p.short)+'</text>'+
       '<rect x="'+x0+'" y="'+(y+5)+'" width="'+Math.max(2,X(p.ft)-x0)+'" height="18" rx="4" fill="'+(p.id==='denver'?'var(--muted)':me?'var(--rj)':'var(--s2)')+'"/>'+
       '<text x="'+(X(p.ft)+6)+'" y="'+(y+19)+'" font-size="13">'+fmt(p.ft)+'</text>'});
  s+='<line x1="'+X(D.ft)+'" x2="'+X(D.ft)+'" y1="'+top+'" y2="'+(h-26)+'" stroke="var(--rj)" stroke-dasharray="4 3" stroke-width="2"/>';
  return s+'</svg>'}
function sites(){return IMM.filter(function(p){return p.status==='ready'})}
function chartList(){var l=sites().slice();l.push({id:'denver',short:'Denver (home)',ft:D.ft});return l.sort(function(a,b){return b.ft-a.ft})}

function home(){
  document.title='Raider Immersions';
  var TR=window.TRIPS||{},list=[];
  Object.keys(TR).forEach(function(k){var t=TR[k];if(t.status==='public')list.push({id:t.id,name:t.name,place:t.region,ft:t.ft,lat:t.lat,lon:t.lon,ready:true,fresh:true})});
  IMM.forEach(function(p){if(p.status==='hold'||TR[p.id])return;list.push({id:p.id,name:p.name,place:p.place,ft:p.ft,lat:p.lat,lon:p.lon,ready:p.status==='ready',fresh:false})});
  var h='<p class="lede">One set of resources for every immersion: the place and its people, the barriers that set the price of ordinary life there, labs where you change the numbers, and the same structures in the Denver you live in.</p>'+
   '<div class="grid">'+list.map(function(p){var r=p.ready;
     return (r?'<a class="card" href="#'+p.id+'">':'<div class="card soon">')+'<span class="badge'+(p.fresh?' ready':'')+'">'+(p.fresh?'New research':r?'Earlier draft':'Coming next')+'</span><h3>'+esc(p.name)+'</h3><div class="meta">'+esc(p.place)+(r?'<br>'+fmt(miles(p))+' miles from Denver':'')+'</div>'+(r?'</a>':'</div>')}).join('')+'</div>'+
   '<h2>The same structures at home</h2><p class="lede">Every barrier on a trip has a mirror in Denver: wages, paid leave, health care, what borrowing costs, housing. <a href="#denver-mirror">See the Denver side →</a></p>';
  app.innerHTML=h;window.scrollTo(0,0)}

var TABS=[['over','Overview'],['bar','Barriers'],['before','Before you go'],['after','After you return'],['tools','Lab tools']];
function place(p,tab,ai){
  document.title=p.name+' · Raider Immersions';tab=tab||'over';
  var h='<a class="back" href="#">← All immersions</a><p class="kick">Immersion</p><h2 style="margin-top:0">'+esc(p.name)+'</h2>'+
   '<div class="tabs" role="tablist">'+TABS.map(function(t){return '<button role="tab" aria-selected="'+(t[0]===tab)+'" data-tab="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div><div id="pane"></div>';
  app.innerHTML=h;
  app.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){location.hash=p.id+'/'+b.dataset.tab}});
  var pane=$('#pane');
  if(tab==='over'){
    var up=p.ft-D.ft;
    pane.innerHTML='<p class="lede">'+esc(p.place)+'.</p>'+
     '<div class="stats"><div class="stat"><b>'+fmt(p.ft)+' ft</b><span>'+(up>0?fmt(up)+' ft higher than Denver':fmt(-up)+' ft lower than Denver')+'</span></div>'+
     '<div class="stat"><b>'+fmt(miles(p))+' mi</b><span>from Denver, in a straight line</span></div>'+
     '<div class="stat"><b style="font-size:19px">'+esc(p.lang)+'</b><span>what you will hear</span></div></div>'+
     '<h3>Who we go with</h3><p><b>'+esc(p.partner)+'.</b> '+esc(p.partnerNote)+'</p>'+
     '<h3>History and the Church there</h3><p>'+esc(p.church)+'</p>'+
     '<div class="chart">'+altChart(chartList(),p.id)+'</div>'+
     '<h3>The claim you will test</h3><div class="claim">'+esc(p.claim)+'</div>';
  }else if(tab==='bar'){
    pane.innerHTML='<div class="claim"><b>The claim:</b> '+esc(p.claim)+'</div><p class="muted">Pick an area. Each one has one number to find, sources to start from, and a slide to build: nature, luck, built, and who gains.</p>'+
     '<div class="areas">'+p.areas.map(function(a,i){return '<button class="area-btn" aria-pressed="'+(i===ai)+'" data-a="'+i+'"><span class="n">'+(i+1)+'</span><b>'+esc(a.t)+'</b></button>'}).join('')+'</div><div id="area"></div>';
    pane.querySelectorAll('[data-a]').forEach(function(b){b.onclick=function(){location.hash=p.id+'/bar/'+(+b.dataset.a+1)}});
    if(ai!=null&&p.areas[ai])area(p,ai);
  }else if(tab==='before'||tab==='after'){
    var L=tab==='before'?window.BEFORE:window.AFTER;
    pane.innerHTML='<p class="lede">'+(tab==='before'?'Do these before the trip. Your answers stay on this device.':'Do these in the first week home. Your answers stay on this device.')+'</p>'+
     L.map(function(q,i){var k=p.id+':'+tab+':'+i;return '<div class="prompt"><p>'+(i+1)+'. '+esc(q)+'</p><textarea data-k="'+k+'" aria-label="Your answer">'+esc(store(k))+'</textarea></div>'}).join('')+
     '<button class="btn" id="copy">Copy my answers</button> <span id="copied" class="muted"></span>';
    pane.querySelectorAll('textarea').forEach(function(t){t.oninput=function(){store(t.dataset.k,t.value)}});
    $('#copy').onclick=function(){var txt=p.name+' · '+(tab==='before'?'Before you go':'After you return')+'\n\n'+L.map(function(q,i){return (i+1)+'. '+q+'\n'+store(p.id+':'+tab+':'+i)}).join('\n\n');
      try{navigator.clipboard.writeText(txt).then(function(){$('#copied').textContent='Copied. Paste it into Canvas.'})}catch(e){$('#copied').textContent='Select and copy the text instead.'}};
  }else{
    var ids=(window.RELATED||{})[p.id]||[];
    pane.innerHTML='<p class="lede">Lab tools that show the same forces with numbers you can change.</p><div class="grid">'+ids.map(function(id){var t=window.TOOLS[id];
      return '<a class="card" target="_blank" rel="noopener" href="'+t[1]+id+'"><span class="badge">'+(t[1].indexOf('Math')>0?'MathLab':'CivicsLab')+'</span><h3>'+esc(t[0])+'</h3></a>'}).join('')+'</div>';
  }
  if(!(tab==='bar'&&ai!=null))window.scrollTo(0,0)}

function area(p,i){
  var a=p.areas[i],k=p.id+':sort:'+i,mine=store(k);
  var box=$('#area');
  function src(w){return '<li>'+(w[1]?'<a href="'+esc(w[1])+'" target="_blank" rel="noopener">'+esc(w[0])+'</a>':'<b>'+esc(w[0])+'</b>')+'<br><small>'+esc(w[2])+'</small></li>'}
  box.innerHTML='<div class="area" id="area-top"><p class="kick" style="margin-top:12px">Area '+(i+1)+' of '+p.areas.length+'</p><h3 style="margin-top:0">'+esc(a.t)+'</h3><p>'+esc(a.lead)+'</p>'+
   '<div class="sec"><p class="kick">In plain terms</p><ul>'+a.plain.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>'+
   '<div class="sec"><p class="kick">Find this one</p><div class="find">'+esc(a.find)+'</div>'+(a.honest?'<p class="honest"><b>Be honest:</b> '+esc(a.honest)+'</p>':'')+'</div>'+
   '<div class="sec"><p class="kick">If you get further (optional)</p><ul>'+a.further.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>'+
   '<div class="sec"><p class="kick">Where to look</p><ul class="src">'+a.where.map(src).join('')+'</ul><p class="muted" style="font-size:14px">These are starting points. Use the newest table you can find, write down its date, and if a number cannot be verified, say so: that is a finding.</p></div>'+
   '<div class="sec"><p class="kick">Pull it apart: this is your slide</p><p>Before you read ours: where does most of this barrier come from?</p><div class="sort">'+['Nature','Luck','Built'].map(function(n){return '<button data-s="'+n+'" class="'+(mine===n?'on':'')+'">'+n+'</button>'}).join('')+'</div>'+
   (mine?'<div class="nlb">'+[['Nature',a.nature],['Luck',a.luck],['Built',a.built]].map(function(r){return '<div class="'+(mine===r[0]?'mine':'')+'"><b>'+r[0]+'</b>'+esc(r[1])+'</div>'}).join('')+'</div><p class="muted" style="font-size:14px">There is no single right answer. Your slide should defend your sort with your number.</p>':'')+'</div>'+
   (mine?'<div class="sec"><p class="kick">And somebody gains: who?</p><div class="gains">'+esc(a.gains)+'</div></div><div class="sec"><p class="kick">Carry this question</p><p class="carry">'+esc(a.carry)+'</p></div>':'')+
   '<p style="margin-top:16px">'+(i>0?'<a class="btn ghost" href="#'+p.id+'/bar/'+i+'">← Area '+i+'</a> ':'')+(i<p.areas.length-1?'<a class="btn" style="text-decoration:none" href="#'+p.id+'/bar/'+(i+2)+'">Area '+(i+2)+' →</a>':'')+'</p></div>';
  box.querySelectorAll('[data-s]').forEach(function(b){b.onclick=function(){store(k,b.dataset.s);area(p,i)}});
  var t=$('#area-top');if(t&&t.scrollIntoView)t.scrollIntoView({block:'start'})}

function route(){var h=(location.hash||'').slice(1).split('/');if(window.TRIP_ROUTE&&window.TRIP_ROUTE(h))return;var p=IMM.filter(function(x){return x.id===h[0]&&x.status==='ready'})[0];
  if(!p)return home();var ai=h[2]?parseInt(h[2],10)-1:null;place(p,h[1],isNaN(ai)?null:ai)}
window.addEventListener('hashchange',route);route();
})();
