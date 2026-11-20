/* Jerusalem Farm is a different kind of immersion: a week of chosen simple living in an environmental,
   plant-based Catholic intentional community, with home repair alongside neighbors.
   This file adds (1) an opening section to the jfarm page and (2) the lab "A week of simple living" (key WEEK). */
(function(){'use strict';
var T=window.TRIPS&&window.TRIPS.jfarm;if(!T)return;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fmt(n,d){return Number(n).toLocaleString('en-US',{maximumFractionDigits:d==null?0:d,minimumFractionDigits:d||0})}
function S(text,src,url,care){return {text:text,src:src,url:url,care:!!care}}
function srcA(f){return f.url?'<a href="'+esc(f.url)+'" target="_blank" rel="noopener">'+esc(f.src)+'</a>':esc(f.src)}
function facts(arr){return '<ul class="cus">'+arr.map(function(f){return '<li>'+esc(f.text)+' <small>Source: '+srcA(f)+'</small>'+(f.care?' <span class="pill care">read with care</span>':'')+'</li>'}).join('')+'</ul>'}

var CSJ='https://www.csjsl.org/news/jerusalem-farm-green-living-in-action';
var PRACTICES=[
 S('Jerusalem Farm is a Catholic intentional community in Kansas City’s Historic Northeast, built on four cornerstones: prayer, community, service and simplicity. Its mission joins service retreats, sustainable living and home repair.','Jerusalem Farm via Pledge','https://www.pledge.to/organizations/46-0597938/jerusalem-farm'),
 S('A 3,000-gallon rain collection system supplies the garden and the community’s general water needs.','Sisters of St. Joseph of Carondelet',CSJ,true),
 S('Residents and retreat groups take three showers a week: one normal shower and two bucket showers.','Sisters of St. Joseph of Carondelet',CSJ,true),
 S('On Thursday evenings, from 7 p.m. until daybreak, no electricity is used, not even batteries.','Sisters of St. Joseph of Carondelet',CSJ,true),
 S('Solar panels often make more power than the farm uses; the extra goes back to the utility.','Sisters of St. Joseph of Carondelet',CSJ,true),
 S('A curbside program collects food scraps from more than 80 neighbors each week for the farm’s compost, which feeds the garden. The greenhouse was built from reused wine bottles, tires and steel.','Sisters of St. Joseph of Carondelet',CSJ,true),
 S('Groups are asked not to use cell phones during the week. A tool library lets neighbors borrow tools instead of buying them, and materials saved from one repair go into another.','Sisters of St. Joseph of Carondelet',CSJ,true),
 S('Meals during the week are plant-based.','RJ trip leaders and student reflections',null),
 S('The participation fee for a week-long service retreat is $400 per person.','Jerusalem Farm, retreats page','https://www.jerusalemfarm.org/s/retreats?language=en_US')];
var HARD=['No phone for the whole week. For many RJ students this is the hardest part, especially the first day.',
 'Short showers and bucket showers, and a night with no lights or batteries.',
 'Plant-based meals, three times a day, every day.',
 'Physical work: roofs, fences, brush, compost and gardens, in Kansas City heat or cold. Some of it will not look like helping until someone tells you whom it is for.',
 'A bell that calls everyone to prayer several times a day, and a schedule set by the community, not by you.'];

T.weekIntro='<div class="sec mirror"><p class="kick">This immersion is different</p><h3 style="margin-top:.2em">A week with neighbors, lived simply</h3>'+
 '<p>Jerusalem Farm is not a trip abroad, and it is not a test of how little you can live on. It is a week of relationships: with the community that lives there, with the neighbors whose houses you work on beside them, with each other, and with God. Living simply is what makes room for that. It is a different life, and it is easy to get lost in the living (the bucket showers, the missing phone, the next meal) and miss the people it was meant to bring you closer to.</p>'+
 '<p>Families in Quispicanchi and Quito share work, meals and tools because they have to. Jerusalem Farm chooses to. Both are about neighbors first.</p>'+
 '<h4>Living with neighbors</h4>'+facts([
  S('Jerusalem Farm repairs homes for low-income homeowners in the Historic Northeast. The homeowner repays only the cost of materials, often through a no-interest loan paid in small monthly amounts, and asks no paperwork beyond a signed statement. In 2023 an average project cost about $5,500 and the average bill to the homeowner was about $2,500.','LISC / Hoxie Collective, Jackson County home repair study, 2023','https://www.lisc.org/kansas-city/regional-stories/lisc-releases-report-home-repair-jackson-county'),
  S('About 70 neighbors were waiting for repairs in 2023, roughly a year’s wait; 50 households were served that year.','LISC / Hoxie Collective, 2023','https://www.lisc.org/kansas-city/regional-stories/lisc-releases-report-home-repair-jackson-county'),
  S('In July 2023 the farm opened Kansas City’s first community land trust home in the neighborhood: the trust keeps the land, so the house stays affordable for the next buyer. It had sat with an investor for about ten years.','Northeast News, Jul 2023','https://northeastnews.net/pages/jerusalem-farm-welcomes-new-neighbors-in-northeasts-first-community-land-trust-home/'),
  S('The farm lends ladders and tools to neighbors, collects their food scraps for compost, and shares garden produce.','KCMO Municipal Court resource list; Sisters of St. Joseph of Carondelet','https://www.csjsl.org/news/jerusalem-farm-green-living-in-action',true)])+
 '<h4>What Quispicanchi and Quito do because they have to</h4><ul class="cus">'+
  '<li>In the Peruvian Andes, <i>ayni</i> means you work my field and I work yours; <i>minka</i> and <i>faena</i> are communal work days for what the village needs, like cleaning a canal. These practices outlasted the Spanish, the haciendas and land reform. <small>Source: Raider Immersions research, Peru (Quispicanchi)</small></li>'+
  '<li>Families cook together in <i>ollas comunes</i> (common pots) to save food, fuel and hours; Peru recognized them in law in 2022. <small>Source: <a href="https://busquedas.elperuano.pe/normaslegales/ley-que-reconoce-las-ollas-comunes-y-garantiza-su-sostenibil-ley-n-31458-2061691-1/" target="_blank" rel="noopener">Ley 31458, El Peruano</a></small></li>'+
  '<li>In Quito, a family with an informal income cannot get a mortgage, so they build a room at a time, and the <i>minga</i>, neighbors’ labor, stands in for the loan. RJ groups have joined mingas laying brick and pouring foundations beside the fathers of the family. <small>Source: <a href="https://www.c4wf.org/faqs" target="_blank" rel="noopener">Center for Working Families</a>; Raider Immersions research, Quito</small></li>'+
  '<li>Neighbors save together in rotating savings groups, borrowing from each other at no interest because the bank will not lend to them. <small>See each trip’s loan lab.</small></li></ul>'+
 '<div class="claim"><b>Chosen and necessary.</b> At Jerusalem Farm, sharing tools, meals and work is a way of life a community chose. In Quispicanchi and Quito it is how families survive where the market and the state do not reach. In Denver, most of us buy what neighbors once gave each other. If you could not buy it, what would you have to ask a neighbor for, and who would you ask?</div>'+
 '<h4>How the community lives</h4>'+facts(PRACTICES)+
 '<p class="muted" style="font-size:14px">Most practices are from a profile of the farm in its seventh year (about 2018–19). Ask Jerusalem Farm what has changed before you go.</p>'+
 '<h4>What simple living means</h4>'+
 '<div class="easy"><p>People who have<br>more than they need<br>are not more free.<br>Their things need guarding,<br>their time goes to keeping them,<br>their minds are somewhere else.</p>'+
 '<p>People who have<br>less than they need<br>are not free either.<br>Their days go to getting<br>what everyone should have.</p>'+
 '<p>Simple living is a choice<br>made by people<br>who could choose otherwise:<br>to want less,<br>so there is time<br>for God and neighbor,<br>and more to share.</p>'+
 '<p>Live simply<br>so that others<br>can simply live.</p></div>'+
 '<p class="muted" style="font-size:14px">Written for this page in the plain, short-line form of Peter Maurin’s Easy Essays, the teaching pieces he wrote for the Catholic Worker in the 1930s. The last two lines are a well-known saying, not his.</p>'+
 '<ul class="cus"><li>Pope Francis writes that Christian spirituality offers a way of growing marked by moderation and the capacity to be happy with little, where less is more (<i>Laudato Si’</i>, 222–223).</li>'+
 '<li>He also writes that the time has come for some parts of the world to accept less growth so that resources go to places that need healthy growth (<i>Laudato Si’</i>, 193). <small>Source: <a href="https://w2.vatican.va/content/francesco/en/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html" target="_blank" rel="noopener">Vatican, 2015</a></small></li>'+
 '<li>Catholic teaching holds that the goods of the earth are meant for everyone, so what we own carries a duty toward those who lack what they need (the universal destination of goods). <small>Source: Compendium of the Social Doctrine of the Church, 171–184</small></li></ul>'+
 '<p><a href="#jfarm/labs/WEEK">What if everyone lived this way? Try it →</a></p>'+
 '<h4>What will be hard</h4><ul class="cus">'+HARD.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'+
 '<div class="claim"><b>Do not get lost in the living.</b> The showers, the meals and the dark Thursday night can become the whole story of the week: what you gave up and whether you made it. They are not the point. At the end of each day, ask whose name you learned, whom you worked beside, and what they taught you.</div>'+
 '<div class="claim"><b>Chosen and not chosen.</b> For you, simplicity is a discipline you take on for a week. Some neighbors on the same blocks go without hot water, a working furnace or a safe roof because they cannot afford them, every week. Both can teach, but they are not the same thing, and mistaking one for the other is a fence. The barriers on this page are about the neighbors. <a href="#jfarm/labs/WEEK">Try a week of simple living →</a></div></div>';

// ---------- before you go: practice ----------
var TRY=[['neighbor','Something with a neighbor','Borrow instead of buying, share a meal, or help with a chore, and let someone help you.'],['phone','A phone-free evening','From dinner to bed, phone off and in another room.'],
 ['shower','A short or bucket shower','Four minutes, or a bucket of water and a cup.'],
 ['food','A plant-based day','Three meals and snacks with no meat, fish, eggs or dairy.'],
 ['dark','An evening with no lights or screens','From sundown: candles or flashlights only if you must, and talk.']];
T.beforeExtra=function(p){var st={};
  function draw(){
    p.insertAdjacentHTML('afterbegin','');
    var box=p.querySelector('#practice');
    box.innerHTML='<h3>Practice simple living before you go</h3><p class="lede">In the week before the trip, try each of these once. After each, write one line: what was hard, and what you noticed. On the trip, compare what was hard at home with what is hard at the farm.</p>'+
     TRY.map(function(x){return '<div class="fam"><h4><label><input type="checkbox" data-try="'+x[0]+'"'+(st[x[0]+'d']?' checked':'')+'> '+esc(x[1])+'</label></h4><p class="muted" style="font-size:14px">'+esc(x[2])+'</p><label class="ans"><span>What was hard? What did you notice?</span><textarea rows="2" data-tn="'+x[0]+'">'+esc(st[x[0]]||'')+'</textarea></label></div>'}).join('')+
     '<p><button class="btn" data-tcopy>Copy my notes</button> <span class="muted" data-tcopied></span></p><p class="muted" style="font-size:14px">Not saved. Copy your notes before you leave the page.</p>';
    box.querySelectorAll('[data-try]').forEach(function(c){c.onchange=function(){st[c.dataset.try+'d']=c.checked}});
    box.querySelectorAll('[data-tn]').forEach(function(a){a.oninput=function(){st[a.dataset.tn]=a.value}});
    box.querySelector('[data-tcopy]').onclick=function(){var txt='Practicing simple living (Jerusalem Farm)\n\n'+TRY.map(function(x){return (st[x[0]+'d']?'[x] ':'[ ] ')+x[1]+'\n'+(st[x[0]]||'(no notes)')}).join('\n\n'),out=box.querySelector('[data-tcopied]');
      try{navigator.clipboard.writeText(txt).then(function(){out.textContent='Copied.'},function(){out.textContent='Copy failed.'})}catch(e){out.textContent='Copy failed.'}};
  }
  p.insertAdjacentHTML('afterbegin','<div class="sec mirror" id="practice"></div>');draw()};

// ---------- lab: A week of simple living ----------
var WATER=S('The average American shower lasts 7.8 minutes at 2.1 gallons a minute, about 15.8 gallons.','Water Research Foundation data via Home Water Works','https://home-water-works.org/indoor-use/showers');
var FOOD=S('Greenhouse gas emissions per kilogram of food: beef (beef herd) 99.48 kg CO₂e, pork 12.31, poultry 9.87, beans and other pulses 1.79 (global averages).','Poore & Nemecek (2018) via Our World in Data','https://ourworldindata.org/grapher/ghg-per-kg-poore?tab=chart');
var SCREEN=S('A typical U.S. teen spends about eight hours a day on screen media for entertainment, outside school.','Common Sense Media Census, Oct 2026','https://www.commonsensemedia.org/research/the-2026-common-sense-media-census-tech-and-media-use-by-tweens-and-teens');
var KG={beef:99.48,pork:12.31,chicken:9.87,plant:1.79},SPEND={away:3945,fun:3609,clothes:2001},HH=137994000;
T.interactive=T.interactive||{};
T.interactive.WEEK={kind:'SimpleWeek',first:true,title:'A week of simple living',
 question:'Set your own normal week and see what a Jerusalem Farm week changes in water, food and time on a screen. Then see what would happen if everyone lived a little more simply.',
 notice:'The biggest change is usually not water or carbon. It is the hours, and whom you spend them with.',
 yourCall:'Which part of the week would be hardest for you to give up, and why? Which of these do neighbors in the Historic Northeast go without because they choose to, and which because they have to?'};
window.SIMPLE_WEEK=function(t,cfg,box){
  var st={cut:25,give:50,showers:7,mins:7.8,gpm:2.1,bucket:2,beef:3,chicken:5,pork:2,serve:150,screen:8};
  function everyone(){
    var cut=st.cut/100,give=st.give/100,per=(SPEND.away+SPEND.fun+SPEND.clothes)*cut,given=per*give,total=given*HH;
    function b(n){return n>=1e9?'$'+fmt(n/1e9,1)+' billion':'$'+fmt(n/1e6)+' million'}
    return '<div class="sec"><h3>3 · If every U.S. household lived a little more simply</h3>'+
     '<p>An average U.S. household spent $3,945 on restaurants and takeout, $3,609 on entertainment and $2,001 on clothes in 2024. <small>Source: <a href="https://www.bls.gov/opub/ted/2026/housing-and-transportation-accounted-for-50-percent-of-household-spending-in-2024.htm" target="_blank" rel="noopener">BLS, Consumer Expenditure Survey</a></small> There are about 138 million U.S. households (2025). <small>Source: <a href="https://www.bls.gov/news.release/cesan.htm" target="_blank" rel="noopener">BLS, Oct 2026</a></small></p>'+
     '<div class="sliders"><label>Spend this much less on those three: <b>'+st.cut+'%</b><input type="range" min="0" max="100" step="5" value="'+st.cut+'" data-w="cut"></label>'+
     '<label>Share of the savings given away: <b>'+st.give+'%</b><input type="range" min="0" max="100" step="5" value="'+st.give+'" data-w="give"></label></div>'+
     '<p class="fsum">Each household would free <b>$'+fmt(per)+'</b> a year and give <b>$'+fmt(given)+'</b>. Across the country that is about <b>'+b(total)+' a year</b> (our arithmetic).</p>'+
     '<div class="fam"><h4>Set beside the world’s needs</h4><ul class="cus">'+
      '<li>About 831 million people lived in extreme poverty in 2025, on less than $3 a day. <small>Source: <a href="https://www.worldbank.org/en/topic/poverty/overview" target="_blank" rel="noopener">World Bank</a></small></li>'+
      '<li>Economists estimate that ending extreme poverty worldwide would cost about $318 billion a year, about 0.3% of the world’s economy. '+(total>=318e9?'This setting would give <b>more than that</b>.':'This setting would cover about <b>'+fmt(total/318e9*100)+'%</b> of it.')+' <small>Source: <a href="https://www.nber.org/papers/w34583" target="_blank" rel="noopener">Sahoo, Blumenstock et al., NBER 2025</a>; <a href="https://www.ischool.berkeley.edu/news/2026/bold-calculation-what-would-it-cost-end-extreme-poverty-worldwide" target="_blank" rel="noopener">UC Berkeley, 2026</a></small></li>'+
      '<li>The richest 10% of the world’s people account for about half of carbon emissions from what people consume; the richest 1% for 16%, as much as the poorest two-thirds of humanity. Most of the world’s richest 10% have lived in high-income countries like the U.S. <small>Source: <a href="https://www.oxfam.de/system/files/documents/carbon_inequality_kills.pdf" target="_blank" rel="noopener">Oxfam with Stockholm Environment Institute, 2023–24</a></small></li></ul></div>'+
     '<div class="fam"><h4>What it would do, and what it would not</h4><ul class="cus">'+
      '<li>Spending less does not move money to anyone by itself. It redistributes only when what is saved is shared: given away, or paid through taxes and public programs.</li>'+
      '<li>Spending less also means less income for the people who cook, sell and make those things, some of them in the countries students visit. Who pays for our simplicity matters too.</li>'+
      '<li>People disagree about the path. Pope Francis calls rich places to accept less growth so others can grow. The World Bank argues that poor countries need broad-based economic growth and jobs to leave poverty. Many argue for both: rich places using less, and poor places growing. <small>Source: <a href="https://thedocs.worldbank.org/en/doc/229ff18129687a785f08af7cfb28e5e1-0350012025/original/WBG-Poverty-and-Inequality-Update-Fall-2025.pdf" target="_blank" rel="noopener">World Bank, Oct 2025</a></small></li></ul></div></div>'}
  function draw(){
    var meat=st.beef+st.chicken+st.pork,plant=Math.max(0,21-meat),kgm=st.serve/1000;
    var myWater=st.showers*st.mins*st.gpm,jfWater=st.mins*st.gpm+2*st.bucket;
    var myFood=(st.beef*KG.beef+st.chicken*KG.chicken+st.pork*KG.pork+plant*KG.plant)*kgm,jfFood=21*KG.plant*kgm;
    var myScreen=st.screen*7;
    function row(label,mine,jf,unit,d){var max=Math.max(mine,jf)||1;return '<div class="fam"><h4>'+label+'</h4>'+
      '<p style="margin:.2em 0">Your week: <b>'+fmt(mine,d)+' '+unit+'</b></p><div class="stack hw"><span class="sg gap" style="width:'+(mine/max*100)+'%"></span></div>'+
      '<p style="margin:.4em 0 .2em">A Jerusalem Farm week: <b>'+fmt(jf,d)+' '+unit+'</b></p><div class="stack hw"><span class="sg" style="width:'+(jf/max*100)+'%;background:var(--good)"></span></div></div>'}
    box.innerHTML='<div class="sec"><h3>1 · Your normal week</h3><div class="sliders">'+
      '<label>Showers a week: <b>'+st.showers+'</b><input type="range" min="0" max="14" step="1" value="'+st.showers+'" data-w="showers"></label>'+
      '<label>Minutes per shower: <b>'+fmt(st.mins,1)+'</b><input type="range" min="2" max="25" step="0.5" value="'+st.mins+'" data-w="mins"></label>'+
      '<label>Meals with beef this week: <b>'+st.beef+'</b><input type="range" min="0" max="21" step="1" value="'+st.beef+'" data-w="beef"></label>'+
      '<label>Meals with chicken: <b>'+st.chicken+'</b><input type="range" min="0" max="21" step="1" value="'+st.chicken+'" data-w="chicken"></label>'+
      '<label>Meals with pork: <b>'+st.pork+'</b><input type="range" min="0" max="21" step="1" value="'+st.pork+'" data-w="pork"></label>'+
      '<label>Hours a day on a screen for fun: <b>'+st.screen+'</b><input type="range" min="0" max="14" step="0.5" value="'+st.screen+'" data-w="screen"></label>'+
      '<label>Gallons in a bucket shower: <b>'+st.bucket+'</b> <span class="pill care">your estimate</span><input type="range" min="1" max="5" step="0.5" value="'+st.bucket+'" data-w="bucket"></label></div>'+
      (meat>21?'<p class="muted">That is more than 21 meals; the plant-based count is set to zero.</p>':'')+
      '<p class="muted" style="font-size:14px">The other '+plant+' of 21 meals count as plant-based (beans and other pulses). One serving of meat or beans is counted as '+st.serve+' g (our assumption).</p></div>'+
      '<div class="sec"><h3>2 · The same week at Jerusalem Farm</h3>'+
      row('Water for showers',myWater,jfWater,'gallons',0)+
      row('Greenhouse gas from the main food in your meals',myFood,jfFood,'kg CO₂e',1)+
      row('Hours on a screen for fun',myScreen,0,'hours',0)+
      '<p class="fsum">A Jerusalem Farm week: one normal shower and two bucket showers, 21 plant-based meals, no phone. That gives back <b>'+fmt(myScreen)+' hours</b> for the people around you, saves about <b>'+fmt(Math.max(0,myWater-jfWater))+' gallons</b> of shower water, and cuts the food emissions counted here by about <b>'+fmt(Math.max(0,myFood-jfFood),1)+' kg CO₂e</b> (our arithmetic).</p>'+
      '<ul class="cus"><li>'+esc(WATER.text)+' <small>Source: '+srcA(WATER)+'</small></li><li>'+esc(FOOD.text)+' <small>Source: '+srcA(FOOD)+'</small></li><li>'+esc(SCREEN.text)+' <small>Source: '+srcA(SCREEN)+'</small></li></ul>'+
      '<p class="muted" style="font-size:14px">Only the main protein of each meal is counted, so the totals are smaller than a full diet’s footprint. Global averages, not Kansas City farms.</p></div>'+
      everyone()+
      '<div class="claim"><b>Chosen and not chosen.</b> One week of bucket showers is a discipline. A neighbor whose water heater broke last winter takes bucket showers until someone can fix it. On your trip, listen for which is which.</div>';
    box.querySelectorAll('[data-w]').forEach(function(r){r.oninput=function(){st[r.dataset.w]=+r.value;draw();box.querySelector('[data-w="'+r.dataset.w+'"]').focus()}});
  }
  draw()};
})();
