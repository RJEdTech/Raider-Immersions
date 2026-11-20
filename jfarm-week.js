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

T.weekIntro='<div class="sec mirror"><p class="kick">This immersion is different</p><h3 style="margin-top:.2em">A week of chosen simple living</h3>'+
 '<p>Jerusalem Farm is not a trip abroad. It is a week inside a community that has chosen to live simply, close to the earth and close to its neighbors: rainwater, bucket showers, solar power, compost, plant-based meals, no phones. The days are prayer, community, and repairing houses with neighbors who could not otherwise afford it. It is meant to be challenging.</p>'+
 '<h4>How the community lives</h4>'+facts(PRACTICES)+
 '<p class="muted" style="font-size:14px">Most practices are from a profile of the farm in its seventh year (about 2018–19). Ask Jerusalem Farm what has changed before you go.</p>'+
 '<h4>What will be hard</h4><ul class="cus">'+HARD.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'+
 '<div class="claim"><b>Chosen and not chosen.</b> For you, simplicity is a discipline you take on for a week. Some neighbors on the same blocks go without hot water, a working furnace or a safe roof because they cannot afford them, every week. Both can teach, but they are not the same thing, and mistaking one for the other is a fence. The barriers on this page are about the neighbors. <a href="#jfarm/labs/WEEK">Try a week of simple living →</a></div></div>';

// ---------- lab: A week of simple living ----------
var WATER=S('The average American shower lasts 7.8 minutes at 2.1 gallons a minute, about 15.8 gallons.','Water Research Foundation data via Home Water Works','https://home-water-works.org/indoor-use/showers');
var FOOD=S('Greenhouse gas emissions per kilogram of food: beef (beef herd) 99.48 kg CO₂e, pork 12.31, poultry 9.87, beans and other pulses 1.79 (global averages).','Poore & Nemecek (2018) via Our World in Data','https://ourworldindata.org/grapher/ghg-per-kg-poore?tab=chart');
var SCREEN=S('A typical U.S. teen spends about eight hours a day on screen media for entertainment, outside school.','Common Sense Media Census, Oct 2026','https://www.commonsensemedia.org/research/the-2026-common-sense-media-census-tech-and-media-use-by-tweens-and-teens');
var KG={beef:99.48,pork:12.31,chicken:9.87,plant:1.79};
T.interactive=T.interactive||{};
T.interactive.WEEK={kind:'SimpleWeek',first:true,title:'A week of simple living',
 question:'Set your own normal week. Then see what a Jerusalem Farm week changes in water, food, and time on a screen.',
 notice:'The biggest change is usually not water or carbon. It is the hours.',
 yourCall:'Which part of the week would be hardest for you to give up, and why? Which of these do neighbors in the Historic Northeast go without because they choose to, and which because they have to?'};
window.SIMPLE_WEEK=function(t,cfg,box){
  var st={showers:7,mins:7.8,gpm:2.1,bucket:2,beef:3,chicken:5,pork:2,serve:150,screen:8};
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
      '<p class="fsum">A Jerusalem Farm week: one normal shower and two bucket showers, 21 plant-based meals, no phone. That gives back <b>'+fmt(myScreen)+' hours</b>, saves about <b>'+fmt(Math.max(0,myWater-jfWater))+' gallons</b> of shower water, and cuts the food emissions counted here by about <b>'+fmt(Math.max(0,myFood-jfFood),1)+' kg CO₂e</b> (our arithmetic).</p>'+
      '<ul class="cus"><li>'+esc(WATER.text)+' <small>Source: '+srcA(WATER)+'</small></li><li>'+esc(FOOD.text)+' <small>Source: '+srcA(FOOD)+'</small></li><li>'+esc(SCREEN.text)+' <small>Source: '+srcA(SCREEN)+'</small></li></ul>'+
      '<p class="muted" style="font-size:14px">Only the main protein of each meal is counted, so the totals are smaller than a full diet’s footprint. Global averages, not Kansas City farms.</p></div>'+
      '<div class="claim"><b>Chosen and not chosen.</b> One week of bucket showers is a discipline. A neighbor whose water heater broke last winter takes bucket showers until someone can fix it. On your trip, listen for which is which.</div>';
    box.querySelectorAll('[data-w]').forEach(function(r){r.oninput=function(){st[r.dataset.w]=+r.value;draw();box.querySelector('[data-w="'+r.dataset.w+'"]').focus()}});
  }
  draw()};
})();
