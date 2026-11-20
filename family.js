/* Raider Immersions: "Your family's road" (#family).
   A private page: nothing is saved, stored or sent. Students pick how and when their family came,
   compare the rules then with the rules now, and get questions to ask a relative.
   Every fact carries its source. It never asks about anyone's immigration papers or status. */
(function(){
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function src(d){return d.url?'<a href="'+esc(d.url)+'" target="_blank" rel="noopener">'+esc(d.src)+'</a>':esc(d.src)}
function S(text,s,url){return {text:text,src:s,url:url}}

var HOW=[
 {id:'chose',label:'Someone chose to move here (for work, family or school)'},
 {id:'fled',label:'Someone fled danger or persecution (a refugee or asylum seeker)'},
 {id:'force',label:'Ancestors were brought here by force, in the slave trade',
  facts:[S('Congress banned bringing enslaved people into the country in 1808; slavery itself continued until the Civil War. Being taken by force is not migration by choice, and the reasons below do not fit it the same way.','Library of Congress, immigration timeline','https://www.loc.gov/classroom-materials/immigration/global-timeline/')]},
 {id:'border',label:'The border moved, not us (families in the Southwest since before 1848)',
  facts:[S('Before there was a Colorado, southern and western Colorado were part of Spain, then Mexico. In 1848 the Treaty of Guadalupe Hidalgo made the area part of the United States; nearly 80,000 Mexican citizens lived in the ceded lands, and the treaty promised to protect them.','History Colorado','https://www.historycolorado.org/node/4778'),
         S('Many Hispano families later lost their land-grant lands. In 2002 San Luis Valley activists won back access to some communal land.','History Colorado','https://www.historycolorado.org/node/4778')]},
 {id:'native',label:'We were already here (Native American)',
  facts:[S('Native nations were here before any border. Early U.S. policy dealt with each tribe as a separate nation. Your family’s story may be about land and treaties rather than migration; tell it that way.','Library of Congress, immigration timeline','https://www.loc.gov/classroom-materials/immigration/global-timeline/')]},
 {id:'adopted',label:'Adopted from another country'},
 {id:'unknown',label:'I don’t know yet'}];

var ERAS=[
 {id:'e1',label:'Before 1882',then:[S('Until 1890 the states, not the federal government, ran immigration, and there were almost no national limits.','Ellis Island Foundation','https://www.ellisisland.org/ellis-island/overview-history/')]},
 {id:'e2',label:'1882–1923 (the Ellis Island years)',then:[
   S('The Chinese Exclusion Act of 1882 barred Chinese laborers, the first major law to keep out a group by nationality.','National Archives','https://www.archives.gov/milestone-documents/chinese-exclusion-act'),
   S('Most Europeans needed no visa. About 2% of those who reached Ellis Island were refused entry and sent back.','National Park Service, Ellis Island','https://home.nps.gov/elis/planyourvisit/second-floor.htm')]},
 {id:'e3',label:'1924–1964 (the quota years)',then:[
   S('The 1924 law set national-origins quotas of 2% of each group’s numbers in the 1890 census and shut out immigrants from Asia; quotas lasted until 1965.','Immigration History (University of Texas)','https://immigrationhistory.org/item/1924-immigration-act-johnson-reed-act/'),
   S('From 1942 to 1964 the Bracero Program signed 4.6 million contracts for Mexican workers on U.S. farms and railroads; many men came back several times.','Bracero History Archive','https://braceroarchive.org/about')]},
 {id:'e4',label:'1965–1985',then:[
   S('The 1965 law replaced quotas with a system that gave most visas to relatives of U.S. citizens, whatever their nationality.','Bipartisan Policy Center','https://bipartisanpolicy.org/blog/top-10-major-laws-affecting-immigration-today/'),
   S('The Refugee Act of 1980 created the refugee resettlement program; more than 2 million refugees have been resettled since.','Bipartisan Policy Center','https://bipartisanpolicy.org/blog/top-10-major-laws-affecting-immigration-today/')]},
 {id:'e5',label:'1986–1995',then:[
   S('The 1986 law penalized employers who hired workers without papers and legalized about 2.7 million people already living here.','Migration Policy Institute','https://www.migrationpolicy.org/publication/key-immigration-laws-and-policy-developments-1986')]},
 {id:'e6',label:'1996–2011',then:[
   S('A 1996 law created re-entry bars: a person who stayed without status for more than 180 days and then left could not come back legally for 3 years; more than a year, 10 years.','American Immigration Council','https://americanimmigrationcouncil.org/fact-sheet/three-and-ten-year-bars')]},
 {id:'e7',label:'2012–2024',then:[
   S('Humanitarian parole programs let more than 500,000 people from Cuba, Haiti, Nicaragua and Venezuela live and work here legally; they were ended in 2025.','Texas Observer','https://www.texasobserver.org/what-kind-of-life-is-this/')]},
 {id:'e8',label:'2025 to now',then:[
   S('Since January 20, 2025, a proclamation bars asylum for people who cross the southern border without permission. The Supreme Court agreed on November 13, 2026 to decide whether it is lawful.','Latin Times, Nov 2026','https://www.latintimes.com/supreme-court-trump-border-asylum-ban-challenge-601386')]}];

var NOW=[
 S('Immigration judges granted asylum in 5.5% of decisions in June 2026.','TRAC, Aug 2026','https://tracreports.org/reports/779/'),
 S('ICE carried out a record 483,200 deportations in fiscal 2026.','Al Jazeera, Nov 2026','https://www.aljazeera.com/news/2026/11/13/us-reports-record-number-of-deportations-and-arrests-in-2026'),
 S('The end of Temporary Protected Status for about 72,000 Hondurans took effect in February 2026, while the court case continues.','Fragomen, Feb 2026','https://www.fragomen.com/insights/united-states-ninth-circuit-stays-district-court-order-again-halting-tps-protection-for-honduras-nepal-and-nicaragua-while-appeal-continues.html')];

var WHY=[
 {id:'work',label:'Work and money'},{id:'family',label:'To join family'},{id:'danger',label:'Violence or danger'},
 {id:'persec',label:'Persecution (faith, politics, or who they were)'},{id:'war',label:'War'},
 {id:'land',label:'Hunger, lost land, or a disaster'},{id:'school',label:'School'},{id:'dk',label:'I don’t know yet'}];
var WHY_NOW=[
 S('Hondurans deported in 2025 most often named work and money (86.9%), then violence (9.7%) and joining family (8.9%).','IDB, Return and Reintegration in Honduras, Oct 2025','https://publications.iadb.org/publications/english/document/Return-and-Reintegration-in-Honduras.pdf'),
 S('Honduran children who migrated named joining family (29.2%) and work (27.8%); 63.4% traveled on their own.','IOM survey via La Prensa','https://www.laprensa.hn/honduras/oim-menores-hondurenos-migra-cuenta-propia-hacia-estados-unidos-HB14046573'),
 S('People who fled Venezuela name economic collapse, political repression and insecurity.','WIIS, Feb 2026','https://wiis.ssmu.ca/2026/02/17/reverse-migration-and-criminal-adaptation-a-new-phase-in-venezuelas-displacement-crisis/')];

var ASK=['Who was the first in our family to come here, and from where?',
 'Why did they leave then, and not earlier or later?',
 'Who decided, and who stayed behind?',
 'What did it cost, and how did they pay for it?',
 'Who helped them on the way, or when they arrived?',
 'What was hardest in the first year?',
 'What did they keep: a language, a food, a prayer, a song, a saint?',
 'What did they lose or leave behind?',
 'Did anyone go back, or try to?',
 'What do you wish people today understood about it?'];

function render(app){
  var st={how:{},era:{},why:{},notes:''};
  document.title='Your family’s road · Raider Immersions';
  function chk(group,list){return '<div class="fq">'+list.map(function(x){return '<label class="fchk"><input type="checkbox" data-g="'+group+'" value="'+x.id+'"'+(st[group][x.id]?' checked':'')+'> '+esc(x.label)+'</label>'}).join('')+'</div>'}
  function facts(arr){return '<ul class="cus">'+arr.map(function(f){return '<li>'+esc(f.text)+' <small>Source: '+src(f)+'</small></li>'}).join('')+'</ul>'}
  function draw(){
    var hows=HOW.filter(function(x){return st.how[x.id]}),eras=ERAS.filter(function(x){return st.era[x.id]}),whys=WHY.filter(function(x){return st.why[x.id]});
    var h='<a class="back" href="#">← All immersions</a><p class="kick">For every trip</p><h2 style="margin-top:0">Your family’s road</h2>'+
     '<p class="lede">Almost every family in Denver has a story of how it came to be here: last year, a century ago, or never across a border at all. Put yours beside the stories you will hear on your trip.</p>'+
     '<div class="claim"><b>This page keeps nothing.</b> What you pick or type is not saved or sent anywhere; close the page and it is gone. Copy what you want to keep. “I don’t know yet” is a real answer. Never write anything about anyone’s immigration papers or status, here or in class. That protects families.</div>'+
     '<div class="sec"><h3>1 · How did your family come to be here?</h3><p class="muted">Pick all that fit. Most families have more than one line.</p>'+chk('how',HOW)+
       hows.filter(function(x){return x.facts}).map(function(x){return '<div class="fam"><h4>'+esc(x.label)+'</h4>'+facts(x.facts)+'</div>'}).join('')+'</div>'+
     '<div class="sec"><h3>2 · When did the first of them arrive?</h3><p class="muted">Pick every era that fits a line of your family. Then compare the rules then with the rules a family faces now.</p>'+chk('era',ERAS)+
       eras.map(function(x){return '<div class="fam"><h4>The rules, '+esc(x.label)+'</h4>'+facts(x.then)+'</div>'}).join('')+
       (eras.length?'<div class="fam mirrorbox"><h4>The rules for someone arriving in November 2026</h4>'+facts(NOW)+'<p class="fsum">Would the road your family took still be open? If not, what closed it, and when?</p></div>':'')+'</div>'+
     '<div class="sec"><h3>3 · Why did they leave?</h3><p class="muted">Pick what you know. Families often had several reasons at once.</p>'+chk('why',WHY)+
       (whys.length?'<div class="fam"><h4>What people leaving now say</h4>'+facts(WHY_NOW)+'<p class="fsum">Which of your family’s reasons will you hear from people on your trip? Which won’t you hear?</p></div>':'')+'</div>'+
     '<div class="sec"><h3>4 · Ask someone in your family</h3><p>Pick a few questions, not all ten. Ask; don’t push. “I don’t want to talk about it” is an answer too. You never need to ask about anyone’s papers.</p><ol class="ask">'+ASK.map(function(q){return '<li>'+esc(q)+'</li>'}).join('')+'</ol></div>'+
     '<div class="sec"><h3>5 · Your notes</h3><label class="ans"><span>What did you learn, and what will you listen for on your trip?</span><textarea rows="6" data-notes>'+esc(st.notes)+'</textarea></label>'+
       '<p><button class="btn" data-copyall>Copy everything</button> <span class="muted" data-copied></span></p><p class="muted" style="font-size:14px">Not saved. Copy it into your journal or an email to yourself before you leave the page.</p></div>';
    app.innerHTML=h;
    app.querySelectorAll('[data-g]').forEach(function(c){c.onchange=function(){st[c.dataset.g][c.value]=c.checked;var y=window.scrollY;draw();window.scrollTo(0,y);var el=app.querySelector('[data-g="'+c.dataset.g+'"][value="'+c.value+'"]');if(el)el.focus()}});
    var ta=app.querySelector('[data-notes]');ta.oninput=function(){st.notes=ta.value};
    app.querySelector('[data-copyall]').onclick=function(){
      var lab=function(list,g){return list.filter(function(x){return st[g][x.id]}).map(function(x){return '- '+x.label}).join('\n')||'- (none picked)'};
      var txt='Your family’s road (Raider Immersions)\n\nHow we came to be here:\n'+lab(HOW,'how')+'\n\nWhen:\n'+lab(ERAS,'era')+'\n\nWhy they left:\n'+lab(WHY,'why')+'\n\nQuestions to ask:\n'+ASK.map(function(q,i){return (i+1)+'. '+q}).join('\n')+'\n\nMy notes:\n'+(st.notes||'(blank)');
      var out=app.querySelector('[data-copied]');
      try{navigator.clipboard.writeText(txt).then(function(){out.textContent='Copied.'},function(){out.textContent='Copy failed; select the text and copy it.'})}catch(e){out.textContent='Copy failed; select the text and copy it.'}};
  }
  draw();window.scrollTo(0,0)}
window.FAMILY_PAGE=function(){render(document.getElementById('app'))};
})();
