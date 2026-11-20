/* Different rules: a 12-week precarity simulation. Same family, same events, same choices, replayed under Denver's rules.
   Every number comes from the trip's lab data (labs/<id>.json → TRIPS[id].interactive), with its source shown. */
(function(){'use strict';
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fmt(n,d){return Number(n).toLocaleString('en-US',{maximumFractionDigits:d==null?0:d,minimumFractionDigits:d||0})}
function src(d){return d&&d.src?(d.url?'<a href="'+esc(d.url)+'" target="_blank" rel="noopener">'+esc(d.src)+'</a>':esc(d.src)):''}
var WEEKS=12,DECK=24,WPM=52/12,DAYS=26;
var PLACES=['honduras-teg','honduras-sps','quito','peru','dr','panama','tijuana-toe'];
var REMIT={label:'A relative in the U.S. sends money home',monthly:13568,note:'Hondurans who send regularly average $506.20 a month, about L13,568.',src:'BCH survey via La Prensa, Jan 2026',url:'https://www.laprensa.hn/honduras/remesas-honduras-migrantes-envios-bch-2026-FD31762788',remit:true};
var DEPORT={label:'The relative abroad is deported; the money from the U.S. stops',days:0,deport:true,src:'ICE: a record 483,200 deportations in fiscal 2026 (Al Jazeera, Nov 2026)',url:'https://www.aljazeera.com/news/2026/11/13/us-reports-record-number-of-deportations-and-arrests-in-2026'};
var QUIET={label:'An ordinary week: nothing goes wrong',days:0};
var DEN_MIN={label:'The Denver minimum wage, one full-time earner',monthly:3344,src:'Denver Department of Finance',url:'https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Department-of-Finance/News/2025/Denver-Local-Minimum-Wage-Adjusts-to-19.29-per-Hour-for-2026'};

function lab(id,kind){var t=window.TRIPS&&window.TRIPS[id],I=(t&&t.interactive)||{};for(var k in I)if(I[k].kind===kind)return I[k];return null}
function place(id){
  var t=window.TRIPS[id],H=lab(id,'HoursOfWork'),F=lab(id,'NoFloor'),L=lab(id,'LoanCost'),P=H.places[0],D=lab('honduras-teg','HoursOfWork').places.filter(function(x){return x.id==='den'})[0];
  var pays=P.pays.filter(function(x){return !x.custom&&x.monthly});
  if(/^honduras/.test(id))pays=pays.concat([REMIT]);
  var lenders=L?L.options.filter(function(o){return (o.rate>0||o.monthly>0)}).map(function(o){return {label:o.label,rate:o.rate,monthly:o.monthly,needs:o.needs||[],src:o.src,url:o.url}}):[];
  lenders.sort(function(a,b){return (a.needs.length-b.needs.length)||((b.monthly?b.monthly*12:b.rate)-(a.monthly?a.monthly*12:a.rate))});
  var den=lab('honduras-teg','LoanCost').denver;
  return {id:id,name:t.name,short:t.short||t.name,cur:P.cur,people:H.people,rides:H.rides||44,pays:pays,food:P.food,rent:P.rent,bus:P.bus,
    lenders:lenders,events:(F&&F.events)||[],doing:F&&F.doing,den:D,denLoans:den.options.filter(function(o){return o.rate>0})}}

// seeded deck: the same seed gives the same 12 weeks in every run
function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function deck(P,seed){var r=rng(seed),c=P.events.slice().concat([DEPORT]);while(c.length<WEEKS)c.push(QUIET);
  for(var i=c.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),x=c[i];c[i]=c[j];c[j]=x}return c.slice(0,WEEKS)}
function wkRate(l){if(!l)return 0;return l.monthly?Math.pow(1+l.monthly,12/52)-1:l.rate/52}

/* one run. rules: 'here' | 'w2' (Denver payslip job) | 'cash' (Denver cash work). choices: per week {food, school}. */
function run(P,S,rules,cards,choices,upto){
  var den=rules!=='here',D=P.den,cur=den?'$':P.cur;
  var earners=S.earn.map(function(i){return P.pays[i]}),work=earners.filter(function(e){return !e.remit});
  var wPay=den?Math.max(1,work.length)*DEN_MIN.monthly/WPM:work.reduce(function(a,e){return a+(e.household?e.monthly:e.monthly)},0)/WPM;
  var wRemit=den?0:earners.filter(function(e){return e.remit}).reduce(function(a,e){return a+e.monthly},0)/WPM;
  var food=den?D.food.pp*P.people/WPM:(P.food.hh?P.food.hh:P.food.pp*P.people)/WPM;
  var rentM=den?(D.rent&&D.rent.amt)||0:(P.rent?(P.rent.amt||S.rent||0):0),rent=rentM/WPM;
  var fare=den?D.bus.fare:(P.bus&&P.bus.fare)||0,bus=fare*P.rides/WPM,schoolBus=fare*10;
  var lender=den?(rules==='w2'?P.denLoans[0]:P.denLoans[P.denLoans.length-1]):(S.lender>=0?P.lenders[S.lender]:{label:'Your estimate',monthly:S.est/100}),wr=wkRate(lender);
  var cash=0,debt=0,interest=0,lostPay=0,fullPay=0,short=0,bank=6,queue=[],remitOn=wRemit>0,log=[],basics=0,income=0;
  for(var w=0;w<(upto==null?WEEKS:upto);w++){
    var c=cards[w],ch=choices[w]||{food:1,school:1};
    if(c.days)queue.push({days:c.days,hfwa:c.hfwa,famli:c.famli});
    if(c.deport)remitOn=false;
    var dayPay=wPay/6,lost=0,paid=0,left=6,notes=[];
    while(left>0&&queue.length){var q=queue[0],d=Math.min(left,q.days);left-=d;q.days-=d;if(!q.days)queue.shift();
      if(rules==='w2'&&q.hfwa){var use=Math.min(bank,d);bank-=use;var rest=d-use;paid+=use*dayPay+(q.famli?rest*dayPay*0.9:0);lost+=q.famli?rest*dayPay*0.1:rest*dayPay;
        notes.push(use?'paid sick leave covers '+use+' day'+(use>1?'s':''):'');
        if(rest)notes.push(q.famli?'FAMLI pays about 90% of '+rest+' day'+(rest>1?'s':''):rest+' day'+(rest>1?'s':'')+' unpaid')}
      else{lost+=d*dayPay;notes.push(d+' day'+(d>1?'s':'')+' unpaid')}}
    var inc=wPay-lost+(remitOn?wRemit:0);fullPay+=wPay;lostPay+=lost;income+=inc;
    var need=food+rent+bus+(ch.school?schoolBus:0);basics+=food+rent+bus+schoolBus;
    var spend=food*ch.food+rent+bus+(ch.school?schoolBus:0);
    var i=debt*wr;interest+=i;debt+=i;cash+=inc-spend;
    if(cash<0){debt+=-cash;cash=0;short++}else if(debt>0){var pay=Math.min(cash,debt);debt-=pay;cash-=pay}
    log.push({w:w+1,card:c,inc:inc,need:need,spend:spend,debt:debt,cash:cash,notes:notes.filter(Boolean),food:ch.food,school:ch.school});
  }
  return {cur:cur,lender:lender,wPay:wPay,wRemit:wRemit,food:food,rent:rent,rentM:rentM,bus:bus,schoolBus:schoolBus,fare:fare,cash:cash,debt:debt,interest:interest,lostPay:lostPay,fullPay:fullPay,short:short,log:log,basics:basics,income:income,work:Math.max(1,work.length)}}

function render(app){
  var st={p:'honduras-teg',earn:[0],rent:0,lender:0,est:10,seed:1+Math.floor(Math.random()*999),week:0,choices:[],food:1,school:1,done:false};
  var P=place(st.p);
  function setPlace(id){st.p=id;P=place(id);st.earn=[0];st.lender=P.lenders.length?0:-1;st.rent=P.rent&&P.rent.guess||0;restart()}
  function restart(){st.week=0;st.choices=[];st.done=false;st.food=1;st.school=1}
  setPlace(st.p);
  document.title='Different rules · Raider Immersions';
  function cards(){return deck(P,st.seed)}
  function bar(v,max){return '<span class="sg gap" style="width:'+Math.max(0,Math.min(100,v/(max||1)*100))+'%"></span>'}
  function draw(){
    var C=cards(),R=run(P,st,'here',C,st.choices,st.week),cur=P.cur,h='';
    h+='<a class="back" href="#">← All immersions</a><p class="kick">A simulation for every trip</p><h2 style="margin-top:0">Different rules</h2>'+
      '<p class="lede">Twelve weeks with a family’s real income and real prices. Each week a card says what happens. You choose what to cut. Then the same twelve weeks, the same cards and your same choices are replayed under Denver’s rules.</p>'+
      '<div class="claim">The family is a composite, not a real family. Every amount comes from a source you can check; anything marked <span class="pill care">your estimate</span> has no source yet.</div>';
    // setup
    h+='<div class="sec"><h3>1 · The household</h3><div class="sl"><label>Where <select data-place>'+PLACES.filter(function(id){return window.TRIPS[id]&&window.TRIPS[id].status==='public'}).map(function(id){return '<option value="'+id+'"'+(id===st.p?' selected':'')+'>'+esc(window.TRIPS[id].name)+'</option>'}).join('')+'</select></label></div>'+
      '<p>'+P.people+' people. Who brings money in? <span class="muted">(Pick one or more.)</span></p><div class="fq">'+P.pays.map(function(x,i){return '<label class="fchk"><input type="checkbox" data-earn value="'+i+'"'+(st.earn.indexOf(i)>=0?' checked':'')+'> '+esc(x.label)+': '+(x.remit?'L':cur)+fmt(x.monthly)+' a month'+(x.household?' (the whole family)':'')+' <small>Source: '+src(x)+'</small></label>'}).join('')+'</div>'+
      '<ul class="cus"><li>'+esc(P.food.text)+' <small>Source: '+src(P.food)+'</small></li>'+
      (P.rent?'<li>'+(P.rent.amt?esc(P.rent.text):'<label>'+esc(P.rent.label||'Rent (your estimate)')+': <b>'+cur+fmt(st.rent)+'</b> a month <span class="pill care">your estimate</span><input type="range" min="'+P.rent.min+'" max="'+P.rent.max+'" step="'+P.rent.step+'" value="'+st.rent+'" data-rent></label> <span class="muted" style="font-size:14px">'+esc(P.rent.note||'')+'</span>')+'</li>':'<li>No rent: most families here own or share their house.</li>')+
      (P.bus&&P.bus.fare?'<li>'+esc(P.bus.text)+' <small>Source: '+src(P.bus)+'</small> The earner rides '+P.rides+' times a month; a child going to school by bus rides 10 times a week (our assumption).</li>':'<li>No bus: people walk or the lab has no fare for this place.</li>')+'</ul>'+
      '<p><b>If the money runs out, who lends?</b></p>'+(P.lenders.length?'<div class="sl"><label><select data-lender>'+P.lenders.map(function(l,i){return '<option value="'+i+'"'+(i===st.lender?' selected':'')+'>'+esc(l.label)+': '+(l.monthly?fmt(l.monthly*100)+'% a month':fmt(l.rate*100,1)+'% a year')+(l.needs.length?' (needs: '+esc(l.needs.join(', '))+')':'')+'</option>'}).join('')+'</select></label></div><p class="muted" style="font-size:14px">'+esc((P.lenders[st.lender]||{}).src||'')+'</p>':
        '<label>No lender rate is sourced for this place. Your estimate: <b>'+st.est+'% a month</b> <span class="pill care">your estimate</span><input type="range" min="0" max="30" step="1" value="'+st.est+'" data-est></label>')+
      '<p class="muted" style="font-size:14px">The deck has '+DECK+' cards: the '+P.events.length+' things that can happen in this trip’s FLOOR lab, a deportation, and '+(DECK-P.events.length-1)+' ordinary weeks. You draw '+WEEKS+'. No source gives the odds of each card, so the deck is a way to see what happens, not a forecast. Deck #'+st.seed+' <button class="btn" data-shuffle>New deck</button> Changing anything here starts the twelve weeks over.</p></div>';
    // weekly money picture
    var wkNeed=R.food+R.rent+R.bus,wkIn=R.wPay+R.wRemit;
    h+='<div class="sec"><h3>2 · A normal week</h3><p>Money in: <b>'+cur+fmt(wkIn)+'</b>. The basics: <b>'+cur+fmt(wkNeed)+'</b> (food '+cur+fmt(R.food)+(R.rent?', rent '+cur+fmt(R.rent):'')+(R.bus?', bus '+cur+fmt(R.bus):'')+'). '+
      (wkIn>=wkNeed?'In a normal week the money covers the basics, with '+cur+fmt(wkIn-wkNeed)+' left.':'Even in a normal week the family is <b>'+cur+fmt(wkNeed-wkIn)+' short</b>: '+fmt((1-wkIn/wkNeed)*100)+'% of the basics cannot be paid.')+
      ' <span class="muted">(A month is '+fmt(WPM,2)+' weeks and 26 working days; our arithmetic.)</span></p><div class="stack hw">'+bar(wkIn,Math.max(wkIn,wkNeed))+'</div></div>';
    // play
    h+='<div class="sec"><h3>3 · Twelve weeks</h3><p class="muted">Week '+Math.min(st.week+1,WEEKS)+' of '+WEEKS+' · Cash on hand '+cur+fmt(R.cash)+' · Owed '+cur+fmt(R.debt)+' to '+esc(R.lender.label.toLowerCase())+'</p>';
    if(st.week<WEEKS){var c=C[st.week];
      h+='<div class="fam mirrorbox"><h4>This week’s card</h4><p class="big" style="font-size:22px">'+esc(c.label)+'</p>'+(c.deport&&!R.wRemit?'<p class="muted">No one in this household sends money from abroad, so this card changes nothing for them.</p>':'')+(c.src?'<small>Source: '+src(c)+'</small>':'')+'</div>'+
        '<p><b>Food this week</b></p><div class="wq">'+[[1,'Full basket'],[0.75,'Cut a quarter'],[0.5,'Cut half']].map(function(f){return '<button data-food="'+f[0]+'" class="'+(st.food===f[0]?'on':'')+'">'+f[1]+'</button>'}).join(' ')+'</div>'+
        (R.fare?'<p><b>School this week</b></p><div class="wq"><button data-school="1" class="'+(st.school?'on':'')+'">Send the oldest by bus ('+cur+fmt(R.schoolBus,2)+')</button> <button data-school="0" class="'+(!st.school?'on':'')+'">Keep the oldest home</button></div>':'')+
        '<p><button class="btn" data-play>Live this week →</button></p>'}
    if(R.log.length)h+='<ol class="cus wlog">'+R.log.slice().reverse().map(function(l){return '<li value="'+l.w+'"><b>Week '+l.w+': '+esc(l.card.label)+'.</b> '+(l.notes.length?esc(l.notes.join('; '))+'. ':'')+'In '+cur+fmt(l.inc)+', spent '+cur+fmt(l.spend)+'. '+(l.food<1?'Food cut by '+fmt((1-l.food)*100)+'%. ':'')+(R.fare&&!l.school?'The oldest stayed home. ':'')+(l.debt>0?'Owes '+cur+fmt(l.debt)+'.':'No debt.')+'</li>'}).join('')+'</ol>';
    h+='</div>';
    // replay
    if(st.week>=WEEKS){
      var W=run(P,st,'w2',C,st.choices),K=run(P,st,'cash',C,st.choices),rows=[['Here: '+P.short+', informal work',R],['Denver: a payslip job at the minimum wage',W],['Denver: cash work at the minimum wage',K]];
      var cut=st.choices.filter(function(x){return x.food<1}).length,home=st.choices.filter(function(x){return !x.school}).length;
      h+='<div class="sec"><h3>4 · Same weeks, different rules</h3><p>The same '+WEEKS+' cards and your same choices'+(cut?' (food cut in '+cut+' week'+(cut>1?'s':'')+')':'')+(R.fare&&home?' (the oldest kept home '+home+' week'+(home>1?'s':'')+')':'')+', replayed. Denver runs use Denver prices and '+(R.work||1)+' earner'+((R.work||1)>1?'s':'')+' at the Denver minimum wage. Money is compared as a share of each household’s own pay, so the currencies can sit side by side.</p>'+
        rows.map(function(x){var r=x[1],p=r.fullPay||1;return '<div class="fam"><h4>'+esc(x[0])+'</h4><div class="stack hw">'+bar(r.lostPay,p)+'</div><ul class="cus"><li><b>'+fmt(r.lostPay/p*100)+'%</b> of twelve weeks’ pay lost to the cards</li><li>The money ran out in <b>'+r.short+' of '+WEEKS+'</b> weeks</li><li>Owed at the end: <b>'+r.cur+fmt(r.debt)+'</b> ('+fmt(r.debt/(r.wPay||1),1)+' weeks of pay)</li><li>Interest paid: '+r.cur+fmt(r.interest)+' to '+esc(r.lender.label.toLowerCase())+'</li></ul></div>'}).join('')+
        '<p class="muted" style="font-size:14px">Denver: paid sick leave (Colorado HFWA, 48 hours a year, counted as 6 days) and FAMLI (about 90% of pay for a longer illness or injury at this wage) only reach a job with a payslip. Payslip worker borrows on a credit card ('+fmt(W.lender.rate*100,2)+'% a year; '+esc(W.lender.src)+'); cash worker borrows at Colorado’s 36% cap ('+esc(K.lender.src)+'). Denver food: '+esc(P.den.food.text)+' Rent: '+esc(P.den.rent.text)+' Interest is our weekly arithmetic from the lender’s rate.</p>'+
        '<p><b>Why the cash worker rarely gets the money back.</b> Denver’s minimum wage and wage-theft rules cover every worker, with or without papers. But a worker who fears being reported does not complain: in a survey of 411 day laborers at Denver-area hiring sites, 62% had been cheated of wages and fewer than 40% of them asked anyone for help (Galemba, University of Denver, 2016–17; older, read with care). The card <i>A buyer or boss doesn’t pay</i> is the one that happens most often and is reported least.</p>'+
        (P.doing?'<p><b>What families here do instead.</b> '+esc(P.doing.text)+' <small>Source: '+esc(P.doing.src)+'</small></p>':'')+
        '<div class="claim"><b>Your call.</b> Which made the bigger difference over twelve weeks: how much the family earned, or the rules around the work? What did the Denver cash worker have in common with the family on your trip?</div>'+
        '<p><button class="btn" data-again>Run it again with a new deck</button></p></div>'}
    app.innerHTML=h;wire()}
  function wire(){
    var q=function(s){return app.querySelector(s)};
    q('[data-place]').onchange=function(e){setPlace(e.target.value);draw()};
    app.querySelectorAll('[data-earn]').forEach(function(c){c.onchange=function(){var i=+c.value,k=st.earn.indexOf(i);if(c.checked&&k<0)st.earn.push(i);if(!c.checked&&k>=0)st.earn.splice(k,1);if(!st.earn.length)st.earn=[i];restart();draw()}});
    var r=q('[data-rent]');if(r)r.onchange=function(){st.rent=+r.value;restart();draw()};
    var l=q('[data-lender]');if(l)l.onchange=function(){st.lender=+l.value;restart();draw()};
    var e=q('[data-est]');if(e)e.onchange=function(){st.est=+e.value;restart();draw()};
    q('[data-shuffle]').onclick=function(){st.seed=1+Math.floor(Math.random()*999);restart();draw()};
    app.querySelectorAll('[data-food]').forEach(function(b){b.onclick=function(){st.food=+b.dataset.food;draw()}});
    app.querySelectorAll('[data-school]').forEach(function(b){b.onclick=function(){st.school=+b.dataset.school;draw()}});
    var p=q('[data-play]');if(p)p.onclick=function(){st.choices[st.week]={food:st.food,school:st.school};st.week++;var y=window.scrollY;draw();window.scrollTo(0,y);var n=q('[data-play]')||q('[data-again]');if(n)n.focus()};
    var a=q('[data-again]');if(a)a.onclick=function(){st.seed=1+Math.floor(Math.random()*999);restart();draw()};
  }
  draw();window.scrollTo(0,0)}
window.RULES_PAGE=function(){render(document.getElementById('app'))};
window.RULES_RUN=run;window.RULES_PLACE=place;window.RULES_DECK=deck;
})();
