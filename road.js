/* The road north: a branching simulation for six composite characters.
   Rules for this file: no routes, crossing methods, smuggler contacts or ways around enforcement.
   Every fact carries its source. Every chance is shown, labeled sourced or "your estimate", and adjustable. No win screen. */
(function(){'use strict';
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fmt(n){return Number(n).toLocaleString('en-US',{maximumFractionDigits:0})}
function S(text,src,url,care){return {text:text,src:src,url:url,care:!!care}}
function srcA(f){return f.url?'<a href="'+esc(f.url)+'" target="_blank" rel="noopener">'+esc(f.src)+'</a>':esc(f.src)}

// ---------- sourced facts ----------
var F={
 kidsAlone:S('63.4% of Honduran children who migrate go on their own; asked why, 29.2% named joining family and 27.8% named work.','IOM survey via La Prensa','https://www.laprensa.hn/honduras/oim-menores-hondurenos-migra-cuenta-propia-hacia-estados-unidos-HB14046573'),
 price190:S('A network arrested in San Pedro Sula in October 2026 charged up to L190,000 a person (about $7,000 at the rate the BCH survey implies; our arithmetic); the payment buys no visa, permit or right to enter.','TuNota, Oct 27, 2026','https://www.tunota.com/honduras-hoy/hasta-l190-mil-por-salir-de-honduras-el-negocio-detras-del-sueno-2026-10-27'),
 price12:S('A Honduran family paid $12,000 to a smuggler who then abandoned them in Mexico; he was convicted in February 2026.','El Heraldo, Feb 2026','https://www.elheraldo.hn/cronologia/-/meta/coyote'),
 sells:S('A smuggler arrested in 2026 charged up to $10,000 and handed migrants to criminal groups in Mexico.','El Heraldo, 2026','https://www.elheraldo.hn/sucesos/capturan-coyote-cobraba-10-mil-migrantes-luego-entregaba-criminales-mexico-AA30309584'),
 crime:S('More than half of migrants interviewed in northern Mexico had been victims of crime, mainly kidnapping; some ransoms were as low as $1,000.','InSight Crime via Latin Times, Oct 2025','https://www.latintimes.com/trumps-border-policy-cuts-crossings-fuels-migrant-kidnappings-extortion-mexico-report-590492'),
 stamp:S('In Chiapas, a family of nine was held with about 300 others and charged $1,000 a person.','López-Dóriga, 2024','https://lopezdoriga.com/nacional/crimen-organizado-marca-sellos-migrantes-secuestrarlos-extorsionarlos/'),
 caravan:S('Four caravans left San Pedro Sula between September and November 2026; Mexico’s president says none has reached the U.S. border since January 2025.','EFE via Diario de Yucatán, Nov 16, 2026','https://www.yucatan.com.mx/mundo/2026/11/16/cuarta-caravana-de-migrantes-sale-de-honduras-hacia-ee-uu.html'),
 mexEntry:S('1,854 Hondurans entered Mexico irregularly in January–March 2026, down 71% from a year earlier.','La Prensa, 2026','https://www.laprensa.hn/cronologia/-/meta/migracion-ilegal'),
 comar87:S('Hondurans led Mexico’s refuge requests in 2022–24; in 2023, 87% of Honduran cases decided were approved or given complementary protection.','El Heraldo, 2025','https://www.elheraldo.hn/honduras/uno-de-cada-tres-solicitantes-asilo-mexico-hondureno-NM26080915'),
 comarStay:S('A refugee applicant in Mexico who moves to another state without COMAR’s permission has the case counted as abandoned.','UNHCR Mexico','https://help.unhcr.org/mexico/como-solicitar-la-condicion-de-refugiado-en-mexico/'),
 comarWork:S('With a temporary CURP and a humanitarian visitor card, a refugee applicant may work in Mexico.','UNHCR Mexico','https://help.unhcr.org/mexico/wp-content/uploads/sites/22/2022/04/2022_Folleto-opciones-43.5x42cmsregularizacion22-ESP.pdf'),
 mexDisc:S('28.8% of migrants in Mexico reported discrimination in the past year; Central Americans are among the groups most often discriminated against.','ENADIS 2022 via Gaceta UNAM','https://www.gaceta.unam.mx/discriminados-seis-de-cada-diez-migrantes-en-albergues/'),
 procl:S('Since January 20, 2025, a proclamation bars asylum for people who cross the southern border without permission; only narrower protections remain. The Supreme Court agreed on November 13, 2026 to decide the case, with a ruling expected by June 2027.','Immigration Policy Tracking Project; Latin Times, Nov 2026','https://www.latintimes.com/supreme-court-trump-border-asylum-ban-challenge-601386'),
 border95:S('Southwest border apprehensions fell 95% in fiscal 2026, to 9,000–12,000 a month.','CBP via The Center Square, Oct 2026','https://justthenews.com/nation/states/center-square/southwest-illegal-border-crossing-reach-lowest-level-one-year-us/'),
 uac:S('7,608 children traveling alone reached the southwest border in fiscal 2026 through August, against 109,998 in fiscal 2024.','CBP data via a secondary compiler','https://www.theglobalstatistics.com/unaccompanied-children-statistics-in-us/',true),
 custody:S('Children in federal custody stayed an average of 194 days in June 2026, up from 30 in fiscal 2024; the agency shared more than 460,000 leads on children and sponsors with ICE.','Reuters, Jul 2026','https://www.thestar.com.my/news/world/2026/07/28/exclusive-thousands-of-children-sponsors-arrested-by-ice-after-tips-from-us-child-migrant-agency-'),
 asylum:S('Immigration judges granted asylum in 5.5% of decisions in June 2026.','TRAC, Aug 2026','https://tracreports.org/reports/779/'),
 hearing:S('Asylum seekers in immigration court wait on average 1,764 days, almost five years, for a hearing to be scheduled.','TRAC, May 2026','https://tracreports.org/whatsnew/email.260506.html'),
 ice:S('ICE made more than 491,000 arrests and 483,200 deportations in fiscal 2026, both records.','Al Jazeera, Nov 13, 2026','https://www.aljazeera.com/news/2026/11/13/us-reports-record-number-of-deportations-and-arrests-in-2026'),
 pop14:S('The number of people in the U.S. without legal status reached about 14 million in 2023; it has fallen since.','Pew Research Center via AP','https://abc7.com/post/12-million-immigrants-are-gone-us-labor-force-trump-preliminary-data/17713052/'),
 third:S('By August 31, 2026, the U.S. had sent at least 25,447 people to countries not their own, about 20,000 of them to Mexico; African countries receiving people include South Sudan, Eswatini, Rwanda, Ghana and Equatorial Guinea.','Investigation via VisaVerge; AP via Washington Times','https://www.visaverge.com/news/us-uses-visa-bans-and-410-million-to-deport-25000-to-third-countries/',true),
 hrw:S('People sent to Eswatini, Ghana and South Sudan were arbitrarily detained, and many were left with no practical option but to go home anyway.','Human Rights Watch, Oct 2026','https://www.hrw.org/news/2026/10/08/us-deportations-to-african-countries-not-their-own'),
 returned:S('42,089 Hondurans were returned between January 1 and November 12, 2026.','INM via El Heraldo, Nov 16, 2026','https://www.elheraldo.hn/honduras/mas-42-000-hondurenos-han-retornado-pais-en-lo-que-va-de-2026-LC32658388'),
 afterReturn:S('One to four months after deportation, 68% of Hondurans were working, but 83.3% lived on household incomes under L10,000 a month and 48.7% had skipped meals for lack of money.','IDB, Oct 2025','https://publications.iadb.org/publications/english/document/Return-and-Reintegration-in-Honduras.pdf'),
 again:S('81% of Honduran returnees surveyed do not plan to migrate again; 5% plan to within six months.','IOM and Conadeh via E&N, Feb 2026','https://www.revistaeyn.com/centroamericaymundo/mayoria-de-hondurenos-que-vuelven-a-casa-ya-no-proyectan-regresar-al-norte-GN29249186'),
 cbpHome:S('People who leave on their own through the CBP Home app get a flight and $2,600 (since January 2026); about 72,000 had left that way, most already in detention.','ABC, Jan 2026; CNN via KEYT','https://abc7.com/post/dhs-increasing-deportation-stipend-1000-2600/18444117/'),
 remit:S('Hondurans who send money home regularly average $506.20 a month (about L13,568), more than a self-employed worker in Honduras earns (L9,776).','BCH survey via La Prensa, Jan 2026','https://www.laprensa.hn/honduras/remesas-honduras-migrantes-envios-bch-2026-FD31762788'),
 tps:S('The end of Temporary Protected Status for about 72,000 Hondurans took effect in February 2026 while the court case continues.','Fragomen, Feb 2026','https://www.fragomen.com/insights/united-states-ninth-circuit-stays-district-court-order-again-halting-tps-protection-for-honduras-nepal-and-nicaragua-while-appeal-continues.html'),
 bar:S('A person who entered without permission and lived in the U.S. more than a year faces a 10-year bar if they leave to collect a visa abroad.','American Immigration Council','https://americanimmigrationcouncil.org/fact-sheet/three-and-ten-year-bars'),
 kidsUS:S('Of deported Hondurans surveyed in 2025, 43.5% had children in Honduras and 29.7% had children in the U.S.','IDB, Oct 2025','https://publications.iadb.org/publications/english/document/Return-and-Reintegration-in-Honduras.pdf'),
 pssi:S('The Labor Department found a cleaning contractor employing at least 102 children aged 13–17 on overnight shifts in 13 meat plants in eight states, including Colorado.','U.S. Department of Labor, 2023','https://www.dol.gov/newsroom/releases/whd/whd20230217-1'),
 nyt:S('A New York Times investigation found migrant children, many of whom crossed alone, working in violation of child labor laws in all 50 states, often expected to send money home.','Pulitzer Prizes, 2024','https://www.pulitzer.org/winners/hannah-dreier-new-york-times'),
 wage:S('In a survey of 411 Denver-area day laborers, 62% had been cheated of wages and fewer than 40% asked for help.','Galemba, University of Denver, 2016–17',null,true),
 dale:S('A program that protected workers in labor investigations from deportation was ended in 2025.','CLASP','https://www.clasp.org/blog/without-dale-employers-gain-more-power-to-exploit-workers/'),
 fear82:S('In a California survey, 82% of workers afraid for their immigration status said they were less likely to file a complaint.','San José Spotlight','https://sanjosespotlight.com/california-immigrant-fast-food-workers-afraid-to-report-work-abuses/'),
 taxes:S('Undocumented immigrants paid $8,889 per person in taxes in 2022, more than a third of it toward Social Security, Medicare and unemployment insurance they cannot collect.','ITEP, 2024','https://itep.org/undocumented-immigrants-taxes-2024/'),
 tjShel:S('Tijuana’s shelters ran below 10% of capacity in March 2026, mostly holding Mexicans displaced by violence, and half their funding had disappeared.','Zeta, Mar 2026','https://zetatijuana.com/2026/03/menos-migrantes-y-mas-desplazados-albergues-en-tijuana-al-10-por-ciento-de-su-capacidad/'),
 mexicans:S('In early fiscal 2026, 69% of people apprehended at the U.S. border were Mexican.','WOLA, Apr 2026','https://www.wola.org/2026/04/u-s-mexico-border-update-migration-data-dhs-shutdown-and-new-management-abuses-in-ice-custody-border-walls/'),
 abraza:S('Baja California received 15,399 deported Mexicans between February and November 2025; deportees say most of the promised help has not arrived.','El Imparcial, Jan 2026; Animal Político','https://www.elimparcial.com/tij/tijuana/2026/01/06/deporto-donald-trump-a-mas-de-15-mil-mexicanos/'),
 boat:S('Venezuelans stranded on Panama’s Caribbean coast waited for relatives to wire the $260 a boatman charged per person to go south.','La Nación, 2025','https://www.nacion.com/el-mundo/no-somos-animales-migrantes-rechazan-encierro-en/H6BUD6IZPRE5ZPXRJ57LJZPZ3A/story/'),
 chile:S('Chile’s president, elected on a promise to expel about 300,000 people without status, halted the regularization of 182,000 people in March 2026.','Infobae, Mar 2026','https://www.infobae.com/america/america-latina/2026/03/30/el-gobierno-de-jose-antonio-kast-frena-la-regularizacion-de-182000-migrantes-en-chile/'),
 peru:S('Leading candidates in Peru’s April 2026 election promised to expel migrants without status, often linking crime to immigration.','Primicias/AFP, Apr 2026','https://www.primicias.ec/internacional/elecciones-peru-candidatos-presidenciales-discursos-crimen-migrantes-120152/'),
 ecuador:S('Surveys in January 2026 found 70% of Venezuelans in Ecuador wanted to leave; about 3 in 100 people detained for crimes there in 2021–25 were Venezuelan.','La Prensa de Lara','https://laprensadelara.com/mundo/ecuador-venezolanos-datos-migracion/',true),
 colombia:S('Colombia gave temporary protection to about 1.96 million Venezuelans; 521,272 were still without status in February 2026.','Migración Colombia via IRB Canada','https://irb-cisr.gc.ca/en/country-information/rir/Pages/index.aspx?doc=459107&pls=1'),
 hearingWait:S('In Mexico, refugee applicants must sign in regularly at the office where they applied while their case is decided.','UNHCR Mexico','https://help.unhcr.org/mexico/2026/10/08/curp-temporal-como-la-obtengo/')
};

// ---------- the odds the game uses (every one adjustable) ----------
var ODDS={
 crime:{label:'Robbed, extorted or kidnapped on the way through Mexico',def:50,kind:'survey',why:'A survey share, not an odds: more than half of migrants interviewed in northern Mexico had been victims of crime.',f:'crime'},
 abandon:{label:'A smuggler abandons you or sells you to a criminal group',def:20,kind:'yours',why:'No source counts this. Cases are reported in court and the press, not counted.',f:'sells'},
 stopped:{label:'Stopped by Mexican authorities and sent back before the north',def:50,kind:'yours',why:'No published odds. Mexico’s president says no caravan has reached the U.S. border since January 2025.',f:'caravan'},
 comar:{label:'Mexico grants refuge or protection (Honduran cases)',def:87,kind:'source',why:'87% of Honduran cases decided in 2023 (later years may differ).',f:'comar87'},
 sponsor:{label:'A relative in the U.S. dares to come forward as a child’s sponsor',def:50,kind:'yours',why:'No published odds. The agency shared 460,000+ leads on children and sponsors with ICE.',f:'custody'},
 asylum:{label:'An immigration judge grants asylum',def:5.5,kind:'source',why:'5.5% of decisions in June 2026 (TRAC).',f:'asylum'},
 arrest:{label:'Arrested by ICE in a given year while living without papers',def:3.5,kind:'arith',why:'Our arithmetic: 491,000 arrests in fiscal 2026 ÷ about 14 million people without status (2023). The population has fallen since, so read with care.',f:'ice'},
 thirdc:{label:'Deported to a country that is not your own',def:5,kind:'arith',why:'Our arithmetic: at least 25,447 third-country deportations ÷ 483,200 deportations. Read with care.',f:'third'},
 retal:{label:'The employer retaliates after a wage complaint',def:30,kind:'yours',why:'No published odds. Threats to call ICE over wage complaints are illegal but reported to be rising.',f:'fear82'}
};
var KIND={source:'sourced',survey:'survey share',arith:'our arithmetic',yours:'your estimate'};

// ---------- characters and scenes ----------
// scene: {stage, text, facts:[keys], choices:[{label, go, add:{debt,months,sent}}]} or chance:{odds, yes, no, yesText, noText, add}
var C={};
C.teen={name:'A 14-year-old from San Pedro Sula',sub:'Sent to earn for the family. The family lives on informal pay; a cousin in the U.S. sends money some months.',cur:'$',start:'t0',scenes:{
 t0:{stage:'Home',text:'Your mother does piece work at home; your older brother sells in the market. The cousin in the U.S. stopped sending money in February. Your uncle says a boy your age can earn more in a month up north than your mother earns in three. A man in the neighborhood says he can take you, for a price.',facts:['kidsAlone','remit','price190'],
  choices:[{label:'Stay and work here',go:'E_stay'},{label:'Go with the man the family borrows to pay ($7,000)',go:'t1s',add:{debt:7000}},{label:'Go on your own with a caravan',go:'t1c'}]},
 t1s:{stage:'Through Guatemala and Mexico',chance:{odds:'abandon',yes:'t2a',no:'t2'},text:'The family has borrowed against the house. You leave at night with two other boys.',facts:['price12','sells'],add:{months:1}},
 t1c:{stage:'Through Guatemala and Mexico',chance:{odds:'stopped',yes:'E_returnedChild',no:'t2'},text:'You join a few hundred people walking. Many are families. Within days the group is smaller.',facts:['caravan','mexEntry'],add:{months:1}},
 t2a:{stage:'Southern Mexico',text:'The man who took the money is gone. You are in a city where you know no one, with no money and a phone with no credit. Your mother calls every night.',facts:['price12','mexDisc'],
  choices:[{label:'Ask for refuge in Mexico',go:'t3m'},{label:'Keep going north with whoever is going',go:'t2'}]},
 t2:{stage:'Crossing Mexico',chance:{odds:'crime',yes:'t2k',no:'t3'},text:'The road north through Mexico takes weeks. You sleep where others sleep.',facts:['crime'],add:{months:1}},
 t2k:{stage:'Crossing Mexico',text:'Men stop the group and hold you until each family pays. Your mother borrows again to send $1,000. You are let go. The debt at home has grown.',facts:['crime','stamp'],add:{debt:1000,months:1},choices:[{label:'Go on',go:'t3'},{label:'Ask for refuge in Mexico',go:'t3m'}]},
 t3m:{stage:'Waiting in Mexico',chance:{odds:'comar',yes:'E_mexico',no:'t3'},text:'You file with COMAR. You must stay in this state and sign in regularly; moving means abandoning your case. You find work washing cars for cash.',facts:['comar87','comarStay','comarWork','mexDisc'],add:{months:6}},
 t3:{stage:'Northern Mexico',text:'You reach a city on the U.S. border. Since January 2025 crossing without permission bars asylum; children traveling alone are still taken into U.S. custody. Very few arrive now.',facts:['procl','border95','uac'],
  choices:[{label:'Go to U.S. border agents as a child traveling alone',go:'t4'},{label:'Stay in northern Mexico and look for work',go:'E_strandedMx'},{label:'Ask to be returned home',go:'E_returnedChild'}]},
 t4:{stage:'U.S. custody',chance:{odds:'sponsor',yes:'t5',no:'E_custody'},text:'You are held, then moved to a shelter for children. Staff ask for a relative who can sponsor you. Your cousin is afraid: sponsors’ details now go to ICE.',facts:['uac','custody'],add:{months:6}},
 t5:{stage:'Living in the U.S.',text:'Your cousin signs. You are released to him with a court date years away. School starts at 8; the night shift cleaning a meat plant starts at 11. The family needs money every month.',facts:['nyt','pssi','hearing'],
  choices:[{label:'Work nights and go to school',go:'Y',add:{work:'night'}},{label:'Leave school and work full time',go:'Y',add:{work:'full'}}]},
 Y:{years:5,court:true,end:'E_living'}
}};
C.mother={name:'A mother from Tegucigalpa with a young child',sub:'Extortion closed her small store. She sold the stock to pay the last demand.',cur:'$',start:'m0',scenes:{
 m0:{stage:'Home',text:'The men who charged the store a weekly fee now say you owe a debt you cannot pay. You have your daughter, some savings, and a sister in Mexico City.',facts:['remit','kidsUS'],
  choices:[{label:'Move to another neighborhood and start over',go:'E_stay'},{label:'Go to Mexico and ask for refuge',go:'m1'},{label:'Go toward the U.S. border',go:'m2'}]},
 m1:{stage:'Waiting in Mexico',chance:{odds:'comar',yes:'E_mexico',no:'m2'},text:'You apply in the south of Mexico. You may not move to your sister’s city while the case is open. You sell food on the street; some customers tell you to go home.',facts:['comar87','comarStay','comarWork','mexDisc'],add:{months:8}},
 m2:{stage:'Crossing Mexico',chance:{odds:'crime',yes:'m2k',no:'m3'},text:'Traveling with a child is slower. You carry everything you own.',facts:['crime','mexEntry'],add:{months:2}},
 m2k:{stage:'Crossing Mexico',text:'You are held until your sister wires $1,000. She takes a loan to do it.',facts:['crime','stamp'],add:{debt:1000,months:1},choices:[{label:'Go on',go:'m3'},{label:'Ask for refuge in Mexico instead',go:'m1'}]},
 m3:{stage:'The U.S. border',text:'At the border, the 2025 proclamation means that crossing without permission bars asylum. A family that crosses is detained and processed for removal.',facts:['procl','border95'],
  choices:[{label:'Stay in northern Mexico',go:'E_strandedMx'},{label:'Cross and be detained',go:'D'}]},
 D:{deport:true}
}};
C.ven={name:'A Venezuelan stranded in Mexico',sub:'Left Venezuela for Peru in 2019, went north in 2023, and has been in Mexico for two years.',cur:'$',start:'v0',scenes:{
 v0:{stage:'Mexico',text:'You have worked off the books in three Mexican cities. The U.S. border is closed to asylum. People you know are going south again, back through countries that blamed them the first time.',facts:['procl','mexDisc','chile','peru'],
  choices:[{label:'Ask for refuge in Mexico',go:'v1'},{label:'Turn back south',go:'v2'},{label:'Go to the U.S. border anyway',go:'D'}]},
 v1:{stage:'Waiting in Mexico',chance:{odds:'comar',yes:'E_mexico',no:'v2'},text:'You apply and wait in one state, signing in as required. You work for cash at a car wash.',facts:['comarStay','comarWork','hearingWait'],add:{months:8},note:'The 87% figure is for Honduran cases; Venezuelan cases may differ.'},
 v2:{stage:'Going south',text:'Going south costs money too. On Panama’s coast, people wait for relatives to wire the boat fare. Where will you stop?',facts:['boat','colombia','ecuador','chile','peru'],add:{months:3},
  choices:[{label:'Colombia, which gave papers to most Venezuelans',go:'E_south'},{label:'Home to Venezuela',go:'E_venHome'}]},
 D:{deport:true,ven:true}
}};
C.mich={name:'A family displaced from Michoacán, waiting in Tijuana',sub:'Mexican citizens who fled violence in their home town. They cannot ask Mexico for refuge: it is their own country.',cur:'MX$',start:'x0',scenes:{
 x0:{stage:'Tijuana',text:'You live in a shelter that is almost empty of foreigners now and full of Mexicans like you. Its funding has been cut in half. The U.S. border is a few miles away and closed to asylum.',facts:['tjShel','procl','mexicans'],
  choices:[{label:'Rent a room and work informally in Tijuana',go:'E_tijuana'},{label:'Go back to Michoacán',go:'E_backHome'},{label:'Go to the U.S. border',go:'x1'}]},
 x1:{stage:'The U.S. border',text:'Most people apprehended at the border are Mexican, and Mexicans are returned to Mexico quickly. Deported Mexicans arrive in Tijuana every week.',facts:['mexicans','abraza','procl'],choices:[{label:'Go on',go:'E_tijuanaDeported'}]}
}};
C.tps={name:'A Honduran who lived in the U.S. for 20 years on TPS',sub:'Came at 19, worked construction in Denver with a work permit, two children born here. TPS ended in February 2026.',cur:'$',start:'p0',scenes:{
 p0:{stage:'Denver',text:'Your work permit has expired. Your employer must let you go or keep paying you off the books. Your children are U.S. citizens; the oldest is 15. You send $500 a month to your mother.',facts:['tps','kidsUS','remit','taxes'],
  choices:[{label:'Stay, and work for cash',go:'Y',add:{work:'cash'}},{label:'Leave with the $2,600 payment and a flight',go:'E_cbpHome'},{label:'Ask a lawyer about a family petition',go:'p1'}]},
 p1:{stage:'Denver',text:'Your children are U.S. citizens, but a child must be 21 to petition for a parent. If you first entered without permission, leaving to collect the visa could trigger a 10-year bar.',facts:['bar'],choices:[{label:'Stay, and work for cash while you wait',go:'Y',add:{work:'cash'}},{label:'Leave with the $2,600 payment',go:'E_cbpHome'}]},
 Y:{years:6,end:'E_living'}
}};
C.cuba={name:'A Cuban deported to Mexico',sub:'Detained in Texas in 2025 and sent across the border to Mexico, a country he has never lived in.',cur:'$',start:'c0',scenes:{
 c0:{stage:'Mexico',text:'You have the clothes you were detained in and a phone number for a cousin in Miami. Mexico accepted you, but you have no papers here yet.',facts:['third','procl'],
  choices:[{label:'Ask for refuge in Mexico',go:'c1'},{label:'Work informally and wait',go:'E_strandedMx'}]},
 c1:{stage:'Waiting in Mexico',chance:{odds:'comar',yes:'E_mexico',no:'E_strandedMx'},text:'You apply and stay in one state as required. You find work in a kitchen for cash.',facts:['comarStay','comarWork','mexDisc'],add:{months:8},note:'The 87% figure is for Honduran cases; Cuban cases may differ.'}
}};

// ---------- endings (none is a win) ----------
var E={
 E_stay:{title:'Stayed home, in the informal economy',text:'No debt for a trip, no one gone. Also no floor under a bad week.',facts:['remit'],link:['#rules','Try Different rules to live twelve weeks of it']},
 E_returnedChild:{title:'Returned home',text:'Sent back to Honduras. The trip did not happen, but the family still owes whatever it borrowed.',facts:['returned','afterReturn','again']},
 E_mexico:{title:'Protected in Mexico',text:'Granted refuge or protection in Mexico. You may live and work there and move freely. It is not the U.S., the pay is lower, and some people make clear they do not want you.',facts:['comar87','comarWork','mexDisc']},
 E_strandedMx:{title:'Stranded in Mexico',text:'No papers, no case, no way forward and nothing to go back to. Work is off the books.',facts:['mexDisc','tjShel']},
 E_custody:{title:'Still in custody',text:'No sponsor came forward. You are still in a shelter for children, months after arriving.',facts:['custody']},
 E_living:{title:'Living in the U.S. without papers',text:'You are here, working, and sending money home. Every year carries a risk of arrest, and you pay taxes for benefits you cannot use.',facts:['ice','taxes','wage','remit']},
 E_court:{title:'Granted asylum',text:'A judge granted asylum. This is the rarest ending in this simulation, and it came after years of waiting.',facts:['asylum','hearing']},
 E_deportHome:{title:'Deported home',text:'Sent back to Honduras with the debt still owed.',facts:['returned','afterReturn','again']},
 E_deportMex:{title:'Deported to Mexico',text:'Sent to Mexico, a country that is not your own.',facts:['third','mexDisc']},
 E_deportThird:{title:'Deported to a country across the world',text:'Sent to a country in Africa you have never seen. Many people sent there are detained and end up going home anyway.',facts:['third','hrw']},
 E_cbpHome:{title:'Left with the $2,600',text:'You left on your own with a flight and $2,600. Your children, U.S. citizens, stay or go with you: a choice no one should have to make.',facts:['cbpHome','kidsUS','afterReturn']},
 E_south:{title:'Started over in the south',text:'Back in South America, in a country where politicians have campaigned on blaming people like you, looking for papers that may or may not come.',facts:['colombia','ecuador','chile']},
 E_deportVen:{title:'Deported to Venezuela',text:'Detained at the U.S. border and flown back to the country you left six years ago.',facts:['procl','ice']},
 E_venHome:{title:'Home to Venezuela',text:'Home after six years away, to the country you left.',facts:['boat']},
 E_tijuana:{title:'Living in Tijuana',text:'Safer than home, poorer than before, working with no floor.',facts:['tjShel'],link:['#tijuana-toe/labs/FLOOR','Try the Tijuana work-with-no-floor lab']},
 E_backHome:{title:'Went back to Michoacán',text:'Back where the violence was. Some families do, because there is nowhere else.',facts:['tjShel']},
 E_tijuanaDeported:{title:'Returned to Tijuana',text:'Apprehended and returned to Mexico within days, to the same city you left.',facts:['abraza','mexicans']}
};

// ---------- engine ----------
function render(app){
  var st={c:null,node:null,debt:0,months:0,sent:0,log:[],odds:{},end:null,optOut:false,work:null};
  Object.keys(ODDS).forEach(function(k){st.odds[k]=ODDS[k].def});
  document.title='The road north · Raider Immersions';
  function facts(keys){return keys&&keys.length?'<ul class="cus">'+keys.map(function(k){var f=F[k];return '<li>'+esc(f.text)+' <small>Source: '+srcA(f)+'</small>'+(f.care?' <span class="pill care">read with care</span>':'')+'</li>'}).join('')+'</ul>':''}
  function roll(k){var p=st.odds[k],r=Math.random()*100,hit=r<p,o=ODDS[k];
    st.log.push('<b>Chance:</b> '+esc(o.label)+': '+fmt(p*10)/10+'% ('+KIND[o.kind]+'). '+(hit?'It happened.':'It did not happen.'));return hit}
  function add(a){if(!a)return;if(a.debt)st.debt+=a.debt;if(a.months)st.months+=a.months;if(a.work)st.work=a.work}
  function go(id){var ch=C[st.c],sc=ch.scenes[id];
    if(!sc){return finish(id)}
    if(sc.deport){return deport(sc)}
    if(sc.years){return years(sc)}
    add(sc.add);
    if(sc.chance){st.node=id;st.pending=sc;draw();return}
    st.node=id;st.pending=null;draw()}
  function cont(){var sc=st.pending;st.pending=null;var hit=roll(sc.chance.odds);go(hit?sc.chance.yes:sc.chance.no)}
  function deport(sc){
    st.log.push('<b>Detained.</b> Processed for removal under the 2025 proclamation.');st.months+=2;
    if(sc.ven){var t=roll('thirdc');return finish(t?'E_deportMex':'E_deportVen')}
    var t3=roll('thirdc');if(!t3)return finish('E_deportHome');
    return finish(Math.random()<20000/25447?'E_deportMex':'E_deportThird')}
  function years(sc){
    var monthly=506.2,y;
    for(y=1;y<=sc.years;y++){
      st.months+=12;
      var earn=st.work==='night'?0.5:1,send=monthly*12*earn;st.sent+=send;var pay=Math.min(st.debt,send*0.5);st.debt-=pay;
      var line='<b>Year '+y+'.</b> You send about $'+fmt(send)+' home'+(earn<1?' (night shifts only)':'')+(pay?', and $'+fmt(pay)+' of it pays down the trip debt':'')+'.';
      if(y===2){st.log.push(line);st.pending={exploit:true,sc:sc,y:y};draw();return}
      if(roll('arrest')){st.log.push(line+' Then you are arrested.');return deport({})}
      if(sc.court&&y===sc.years){st.log.push(line);var g=roll('asylum');return finish(g?'E_court':'E_living')}
      st.log.push(line)}
    finish(sc.end)}
  function resumeYears(sc,fromY){
    var monthly=506.2,y;
    for(y=fromY;y<=sc.years;y++){
      st.months+=12;var earn=st.work==='night'?0.5:1,send=monthly*12*earn;st.sent+=send;var pay=Math.min(st.debt,send*0.5);st.debt-=pay;
      var line='<b>Year '+y+'.</b> You send about $'+fmt(send)+' home'+(pay?', and $'+fmt(pay)+' of it pays down the trip debt':'')+'.';
      if(roll('arrest')){st.log.push(line+' Then you are arrested.');return deport({})}
      if(sc.court&&y===sc.years){st.log.push(line);var g=roll('asylum');return finish(g?'E_court':'E_living')}
      st.log.push(line)}
    finish(sc.end)}
  function exploit(choice){var p=st.pending;st.pending=null;
    if(choice==='quiet'){st.log.push('<b>The boss doesn’t pay you for two weeks.</b> You say nothing and lose the pay.');st.sent-=506.2/2}
    else if(choice==='ask'){var r=roll('retal');st.log.push('<b>The boss doesn’t pay you for two weeks.</b> You ask him for the money. '+(r?'He tells you not to come back, and says he knows people at ICE.':'He pays half.'));st.sent-=r?506.2:506.2/4}
    else{var r2=roll('retal');st.log.push('<b>The boss doesn’t pay you for two weeks.</b> You file a claim with the labor office; the law protects you regardless of status. '+(r2?'The boss threatens to report you. You withdraw the claim and lose the job.':'Months later, the claim recovers the pay.'));st.sent-=r2?506.2:0}
    if(roll('arrest')){st.log.push('Later that year, you are arrested.');return deport({})}
    resumeYears(p.sc,p.y+1)}
  function finish(id){st.end=id;st.node=null;draw()}
  function start(c){st.c=c;st.debt=0;st.months=0;st.sent=0;st.log=[];st.end=null;st.work=null;st.pending=null;go(C[c].start)}

  function oddsPanel(){return '<details class="sec"><summary><b>The odds this simulation uses</b> (change any of them)</summary><p class="muted">No agency counts how many people who leave end up living in the U.S. Most odds below are not published anywhere. Each is labeled: <i>sourced</i>, <i>survey share</i> (people asked, not anyone’s odds), <i>our arithmetic</i>, or <i>your estimate</i>.</p>'+
    Object.keys(ODDS).map(function(k){var o=ODDS[k];return '<label class="sl" style="display:block;margin:.6em 0">'+esc(o.label)+': <b>'+st.odds[k]+'%</b> <span class="pill'+(o.kind==='yours'?' care':'')+'">'+KIND[o.kind]+'</span><input type="range" min="0" max="100" step="'+(o.def<10?0.5:1)+'" value="'+st.odds[k]+'" data-odds="'+k+'"><span class="muted" style="font-size:14px">'+esc(o.why)+' <small>Source: '+srcA(F[o.f])+'</small></span></label>'}).join('')+'</details>'}

  function ledger(){var ch=C[st.c];return '<p class="muted">Time on the road: '+(st.months<24?st.months+' month'+(st.months===1?'':'s'):fmt(st.months/12)+' years')+' · Debt for the trip: $'+fmt(st.debt)+(st.sent?' · Sent home: $'+fmt(st.sent):'')+'</p>'}

  function draw(){
    var h='<a class="back" href="#">← All immersions</a><p class="kick">A simulation for every trip</p><h2 style="margin-top:0">The road north</h2>';
    if(!st.c){
      h+='<p class="lede">Six people, six starting points, the rules of November 2026. Choices are yours; some things are left to chance, and every chance is shown with where its number comes from.</p>'+
       '<div class="claim"><b>Before you start.</b> Every character is a composite, not a real person. The simulation never shows routes or ways around the law, and it has no winning ending: nobody counts how many people who leave end up living in the U.S. Some of you have family who made a journey like this. You can walk through it as a character, or <a href="#" data-facts>just read the facts</a>. Nothing you do here is saved.</div>'+
       '<div class="grid">'+Object.keys(C).map(function(k){return '<button class="card" data-char="'+k+'" style="text-align:left;cursor:pointer"><h3>'+esc(C[k].name)+'</h3><div class="meta">'+esc(C[k].sub)+'</div></button>'}).join('')+'</div>'+oddsPanel();
      if(st.facts)h+='<div class="sec"><h3>The facts, on their own</h3>'+facts(Object.keys(F))+'</div>';
    } else if(st.end){var e=E[st.end];
      h+='<p class="kick">'+esc(C[st.c].name)+'</p><div class="fam mirrorbox"><h4>Ending</h4><p class="big" style="font-size:26px">'+esc(e.title)+'</p><p>'+esc(e.text)+'</p>'+ledger()+facts(e.facts)+(e.link?'<p><a href="'+e.link[0]+'">'+esc(e.link[1])+' →</a></p>':'')+'</div>'+
        '<div class="fam"><h4>How realistic was that?</h4><p>Only one ending in this simulation gives legal status in the U.S., and it is the rarest. In 2026 the real numbers point the same way at every stage:</p>'+facts(['border95','asylum','ice','again'])+'<p class="muted" style="font-size:14px">Run it again, or compare endings with your class. If almost everyone ends somewhere other than where they set out for, the simulation is showing something true.</p></div>'+
        (st.log.length?'<div class="sec"><h3>How you got here</h3><ol class="cus wlog">'+st.log.map(function(l){return '<li>'+l+'</li>'}).join('')+'</ol></div>':'')+
        '<div class="claim"><b>Before your trip.</b> Which of these endings might belong to someone you will meet? What would you want to listen for, and what would you never ask?</div>'+
        '<p><button class="btn" data-again>Run this character again</button> <button class="btn" data-menu>Choose another character</button> <button class="btn" data-copy>Copy my journey</button> <span class="muted" data-copied></span></p>'+oddsPanel();
    } else {var ch=C[st.c],sc=st.pending&&st.pending.exploit?null:ch.scenes[st.node];
      h+='<p class="kick">'+esc(ch.name)+'</p>'+ledger();
      if(st.pending&&st.pending.exploit){
        h+='<div class="fam mirrorbox"><h4>Living in the U.S. · year 2</h4><p>The boss hasn’t paid you for two weeks of work. He says business is slow. You know the law says he has to pay you, papers or not.</p>'+facts(['wage','fear82','dale'])+'</div><div class="wq"><button data-ex="quiet">Say nothing</button> <button data-ex="ask">Ask him for the money</button> <button data-ex="claim">File a claim with the labor office</button></div>';
      } else {
        h+='<div class="fam mirrorbox"><h4>'+esc(sc.stage)+'</h4><p>'+esc(sc.text)+'</p>'+(sc.note?'<p class="muted" style="font-size:14px">'+esc(sc.note)+'</p>':'')+facts(sc.facts)+'</div>';
        if(sc.chance){var o=ODDS[sc.chance.odds];h+='<p>What happens next is left to chance: <b>'+esc(o.label)+'</b>, '+st.odds[sc.chance.odds]+'% <span class="pill'+(o.kind==='yours'?' care':'')+'">'+KIND[o.kind]+'</span>.</p><p><button class="btn" data-cont>See what happens →</button></p>'}
        else h+='<div class="wq">'+sc.choices.map(function(x,i){return '<button data-ch="'+i+'">'+esc(x.label)+'</button>'}).join(' ')+'</div>';
      }
      if(st.log.length)h+='<div class="sec"><h3>So far</h3><ol class="cus wlog">'+st.log.map(function(l){return '<li>'+l+'</li>'}).join('')+'</ol></div>';
      h+='<p><button class="btn" data-menu>Start over</button></p>'+oddsPanel();
    }
    app.innerHTML=h;wire()}
  function wire(){var q=function(s){return app.querySelector(s)},all=function(s){return app.querySelectorAll(s)};
    all('[data-char]').forEach(function(b){b.onclick=function(){start(b.dataset.char);window.scrollTo(0,0)}});
    var f=q('[data-facts]');if(f)f.onclick=function(e){e.preventDefault();st.facts=true;draw()};
    all('[data-ch]').forEach(function(b){b.onclick=function(){var sc=C[st.c].scenes[st.node],x=sc.choices[+b.dataset.ch];st.log.push(esc(sc.stage)+': '+esc(x.label)+'.');add(x.add);go(x.go);window.scrollTo(0,0)}});
    var c=q('[data-cont]');if(c)c.onclick=function(){cont();window.scrollTo(0,0)};
    all('[data-ex]').forEach(function(b){b.onclick=function(){exploit(b.dataset.ex);window.scrollTo(0,0)}});
    all('[data-odds]').forEach(function(r){r.onchange=function(){st.odds[r.dataset.odds]=+r.value;var open=true;draw();var d=q('details');if(d&&open)d.open=true}});
    var a=q('[data-again]');if(a)a.onclick=function(){start(st.c);window.scrollTo(0,0)};
    all('[data-menu]').forEach(function(m){m.onclick=function(){st.c=null;st.end=null;draw();window.scrollTo(0,0)}});
    var cp=q('[data-copy]');if(cp)cp.onclick=function(){var tmp=document.createElement('div');tmp.innerHTML=st.log.join('\n');var txt='The road north (Raider Immersions)\n'+C[st.c].name+'\nEnding: '+E[st.end].title+'\n\n'+st.log.map(function(l){var d=document.createElement('div');d.innerHTML=l;return '- '+d.textContent}).join('\n');var out=q('[data-copied]');
      try{navigator.clipboard.writeText(txt).then(function(){out.textContent='Copied.'},function(){out.textContent='Copy failed.'})}catch(e){out.textContent='Copy failed.'}};
  }
  draw();window.scrollTo(0,0)}
window.ROAD_PAGE=function(){render(document.getElementById('app'))};
window.ROAD_DATA={C:C,E:E,F:F,ODDS:ODDS};
})();
