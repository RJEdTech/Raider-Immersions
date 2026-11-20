# Work with no floor (key FLOOR) and real-income Hours of work (key HOURS) for
# Peru, Quito, Honduras (SPS, Tegucigalpa), the DR, Panama and Tijuana.
# Every figure is copied from the research packets or a source checked 19 Nov 2026.
import copy

DEN_MIN = {"src": "Denver Labor", "url": "https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Auditors-Office/Denver-Labor/Citywide-Minimum-Wage"}
HFWA = {"src": "CDLE, Healthy Families and Workplaces Act", "url": "https://cdle.colorado.gov/sites/cdle/files/info_%236b_rights_and_obligations_under_hfwa_2.27.2026.pdf"}
FAMLI = {"src": "Colorado FAMLI", "url": "https://famli.colorado.gov/individuals-and-families/individuals-and-families-faqs"}
DL25 = {"src": "Denver Auditor via Denver7, Nov 2025", "url": "https://www.denver7.com/news/local-news/denver-says-it-has-recovered-a-record-2-31m-in-unpaid-wages-for-7-200-workers"}
GAL = {"src": "Galemba, University of Denver, 2016–17 (via Denver Labor)", "url": "https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Auditors-Office/Denver-Labor/2023-Annual-Wage-Theft-Report", "mark": "care"}
OURS = {"src": "our reading of the eligibility rules (Denver mirror)", "mark": "care"}
ILO = {"src": "ILO (ILOSTAT), definition of informal employment", "url": "https://ilostat.ilo.org/blog/decent-work-reality-check-informality-is-everywhere/"}

def C(v, text, base=None, **kw):
    d = {"v": v, "text": text}
    if base: d.update(base)
    d.update(kw)
    return d

def rows(here):
    """here: dict row-key -> (value, text, srcdict or None)"""
    def H(k):
        v, t, s = here[k]
        return C(v, t, s)
    return [
        {"q": "A minimum wage that applies to you", "here": H("min"),
         "w2": C(True, "$19.29 an hour in 2026, for anyone working in Denver, whatever their immigration status.", DEN_MIN),
         "cash": C("On paper", "The same law covers cash work, but 62% of 411 surveyed Denver-area day laborers had been cheated of wages.", GAL)},
        {"q": "Paid sick days", "here": H("sick"),
         "w2": C(True, "1 hour for every 30 worked, up to 48 hours a year, at every employer. It also covers a sick child and weather closures.", HFWA),
         "cash": C("Only if the boss follows the law", "Denver Labor's 2025 cases included sick-pay violations.", DL25)},
        {"q": "Paid time off after a new baby or a serious illness or injury", "here": H("leave"),
         "w2": C(True, "FAMLI: up to 12 weeks at about 90% of pay for lower earners, once you have $2,500 in reported Colorado wages.", FAMLI),
         "cash": C(False, "FAMLI runs on reported wages. Cash pay doesn't count.", FAMLI)},
        {"q": "Pay while you look for work if the job ends", "here": H("ui"),
         "w2": C(True, "Unemployment insurance, based on reported wages.", OURS),
         "cash": C(False, "No reported wages, no claim.", OURS)},
        {"q": "Credit toward a pension in old age", "here": H("old"),
         "w2": C(True, "Every reported paycheck builds Social Security credits.", OURS),
         "cash": C(False, "Unreported pay builds no credits.", OURS)},
        {"q": "Health care that comes with the work", "here": H("health"),
         "w2": C("Depends on the job", "Many low-wage jobs offer none. Health First Colorado covers adults up to 133% of the poverty level whatever their job.", {"src": "Denver mirror (D-HEALTH)"}),
         "cash": C("Not through the work", "The same income-based coverage is open to them.", {"src": "Denver mirror (D-HEALTH)"})},
        {"q": "A pay record a bank or landlord will accept", "here": H("record"),
         "w2": C(True, "A payslip and a tax record.", OURS),
         "cash": C(False, "Cash leaves no record.", OURS)},
        {"q": "An office that will come if you are cheated", "here": H("office"),
         "w2": C(True, "Denver Labor recovered a record $2.31 million for about 7,200 workers in 2025.", DL25),
         "cash": C("On paper", "The office covers anyone working in Denver, but fewer than 40% of cheated day laborers asked for help.", GAL)},
    ]

def here_set(inst, src, health=None, old=None, office=None, minw=None):
    no = lambda t: (False, t, src)
    return {
        "min": minw or no("Outside a contract, the minimum wage doesn't reach you."),
        "sick": no("A day you don't work is a day you aren't paid."),
        "leave": no("Paid leave runs through " + inst + ", and only for people who pay in."),
        "ui": no("No contract, no claim."),
        "old": old or no("No contributions to " + inst + ", no pension from work."),
        "health": health or no("Coverage through " + inst + " needs contributions."),
        "record": no("No payslip, so no bank loan or formal lease on that income."),
        "office": office or no("No contract means nothing an inspector can enforce."),
    }

EVENTS = [
    {"label": "I'm sick (3 days)", "days": 3, "hfwa": True},
    {"label": "My child is sick (2 days)", "days": 2, "hfwa": True},
    {"label": "Storms stop work (2 days)", "days": 2, "hfwa": True},
    {"label": "I'm hurt (12 days)", "days": 12, "hfwa": True, "famli": True},
    {"label": "Slow week: half the usual sales (3 days)", "days": 3, "w2": "a payslip job can cut hours too, so this is unpaid"},
    {"label": "A buyer or boss doesn't pay (1 day)", "days": 1, "w2": "unpaid unless a claim with Denver Labor recovers it"},
]
MONTH_COMMON = {"days": 26, "den": HFWA,
    "denNote": "Paid sick leave (48 hours a year) covers your own illness, a child's, and weather closures. FAMLI covers a longer illness or injury once you have $2,500 in reported wages. Both need a payslip; cash work gets neither in practice."}
GUESS = "For each item, guess whether the work comes with it. Then check, and compare with two Denver workers: one with a payslip and one paid in cash."
AFTER = "Informal doesn't mean illegal or lazy. It means work that the protections were never built to reach: social insurance, paid sick days, paid leave. Denver has informal work too. The difference is how much of all the work it is."
PIECE_AFTER = "Work paid by the piece is counted in pieces and prices, never in hours. The hours disappear, and so does the comparison with a wage."

def floor(title, question, hereLabel, rates, here, piece, month, doing, notice, yourCall):
    m = dict(MONTH_COMMON); m.update(month)
    m.setdefault("intro", "Pay comes by the day. Pick what happens this month and see who still gets paid.")
    return {"kind": "NoFloor", "title": title, "question": question, "hereLabel": hereLabel, "guessIntro": GUESS,
            "rates": rates, "grid": {"rows": rows(here), "after": AFTER, "def": ILO}, "piece": dict(piece, after=piece.get("after", PIECE_AFTER)),
            "month": m, "events": EVENTS, "doing": doing, "notice": notice, "yourCall": yourCall}

def build(T, peru, DEN_PLACE, US_MONTH, custom):
    # ---------------- Peru ----------------
    pe_src = {"src": "INEI, EPEN, via Expreso (Peru packet, Barrier 15)"}
    pe = floor("Work with no floor: Quispicanchi and Denver",
        "Most work in rural Peru is informal. What does that take away, and what does a woven piece pay by the hour?",
        "Informal work in rural Peru",
        [{"big": "94.5%", "text": "of rural work in Peru is informal (69.8% nationally; 84.8% of workers aged 14–24), Apr 2025–Mar 2026.", **pe_src}],
        here_set("EsSalud and the pension system", pe_src,
                 minw=(False, "S/1,230 a month since October 2026, but most artisans and farm workers are not employees and never touch it.", {"src": "D.S. 015-2026-TR", "url": "https://img.lpderecho.pe/wp-content/uploads/2026/09/DS-015-2026-TR-LPDerecho.pdf"}),
                 office=(False, "Most work has no inspector who will come.", pe_src)),
        {"cur": "S/", "unit": "woven piece", "units": "pieces", "minHour": round(1230 / 208, 2), "minText": "S/1,230 a month on a 48-hour week, our arithmetic",
         "intro": "A weaver thinks in pieces: what one piece brings. Turn it into an hour of work.",
         "options": [{"label": "A woven piece (your estimate)", "price": 80, "mark": "yours", "text": "Nobody publishes what a South Valley weaver receives. INEI, MINCETUR and PROMPERÚ don't count it. Set the price she gets, not the price in a Cusco shop.", "src": "Peru packet, Barrier 2 (checked absence)"}],
         "price": {"min": 5, "max": 600, "step": 5},
         "pace": {"inv": True, "def": 16, "min": 2, "max": 80, "step": 1, "label": "Hours of work for one piece (your estimate)", "note": "16 hours is two working days. Spinning, dyeing and weaving all count. Set your own."}},
        {"cur": "S/", "pay": {"monthly": 918.4, "min": 100, "max": 3000, "step": 10, "text": "Average monthly income from work in rural Peru, S/918.4 (Apr 2024–Mar 2025).", "src": "INEI (Peru packet, 2c)"}},
        {"text": "Associations, cooperatives and ayni (trading work between neighbors) create floors where the law doesn't. Weaving associations sell direct.", "src": "Peru packet, Barriers 2 and 15"},
        "The guess usually goes wrong in the same place: students assume a job comes with something. Most rural work comes with nothing but the pay for the piece or the day. Then notice part 2: when nobody counts hours, a piece that looks well priced can pay less than the minimum wage.",
        "Which missing protection would change a family's year the most? What do they use in its place?")
    peru['interactive']['FLOOR'] = pe

    # ---------------- Quito ----------------
    q_src = {"src": "Quito Instituto de Investigaciones de la Ciudad, Mercado Laboral 2025", "url": "https://investigaciones.quito.gob.ec/wp-content/uploads/2026/04/Mercado-Laboral-Anual-2025.pdf"}
    T['quito']['interactive']['FLOOR'] = floor("Work with no floor: Quito and Denver",
        "Most families the Center serves work informally. What does that take away, and what does piecework pay by the hour?",
        "Informal work in Quito",
        [{"big": "51.9%", "text": "of people with work in Quito have no social-security affiliation at all (2025).", **q_src},
         {"big": "52.8%", "text": "of employed Ecuadorians work in the informal sector, with no tax number (May 2026).", "src": "INEC, ENEMDU, via Expreso", "url": "https://www.expreso.ec/economia-y-negocios/significa-empleo-adecuado-ecuador-sigue-estancado-36-6-286685.html"}],
        here_set("the IESS", q_src, old=(False, "No IESS pension. A $100 pension reaches only the poorest people over 65.", {"src": "Quito packet, 2c"})),
        {"cur": "$", "unit": "sewn piece", "units": "pieces", "minHour": round(482 / (40 * 52 / 12), 2), "minText": "$482 a month on a 40-hour week, our arithmetic",
         "intro": "A mother sewing at home is paid per piece. Turn the piece rate into an hour of work.",
         "options": [{"label": "Piecework sewing at home (your estimate)", "price": 0.25, "mark": "yours", "text": "No source gives a Quito piece rate. Set your own and say so in your answer.", "src": "not yet sourced"}],
         "price": {"min": 0.05, "max": 3, "step": 0.05},
         "pace": {"def": 6, "min": 1, "max": 30, "step": 1, "label": "Pieces finished in an hour (your estimate)", "note": "Count the hours around a child's day: sewing stops when the child needs her."}},
        {"cur": "$", "pay": {"monthly": 360, "min": 50, "max": 1200, "step": 10, "mark": "care", "text": "The Center's families average just over $360 a month for about five people (undated page). Here it is treated as one earner's month.", "src": "The Center (c4wf.org)", "url": "https://www.c4wf.org/our-work"}},
        {"text": "Families pool income across several earners and trades. The Center's own workshops employ former students and mothers in formal jobs.", "src": "Quito packet, Barrier 1"},
        "In Quito about a quarter of workers are in the informal sector, though half have no social security at all; among the Center's families, informal work is the norm. Part 3 shows why a sick child is a money problem here and a scheduling problem for a Denver worker with a payslip.",
        "What would the Center's families need first: a higher price per piece, or a floor under the bad weeks? Why?")

    # ---------------- Honduras (both) ----------------
    hn_src = {"src": "INE Honduras, Informalidad 2024", "url": "https://ine.gob.hn/wp-content/uploads/2025/09/Documento-Informalida2024.pdf"}
    hn_rates = [{"big": "74.8%", "text": "of Honduran workers are informal (Nov 2024); 95.7% of workers aged 15–18.", **hn_src},
                {"big": "About 22%", "text": "of workers pay into social security (IHSS), by the business council's own figures (our arithmetic).", "src": "Cohep via TuNota, May 2026", "url": "https://www.tunota.com/honduras-hoy/trabajadores-no-cuentan-seguridad-social-honduras-2026-05-01", "mark": "care"}]
    hn_here = here_set("the IHSS", hn_src, minw=(False, "No minimum wage anyone enforces. Even among wage earners, 44.75% were paid less than the minimum in 2025.", {"src": "STSS via El Heraldo, Jul 2026", "url": "https://www.elheraldo.hn/economia/casi-870-000-trabajadores-privados-no-reciben-salario-minimo-honduras-AA31572211"}))
    teg_piece = {"cur": "L", "unit": "pound", "units": "pounds", "minHour": round(13292.06 / (44 * 52 / 12), 2), "minText": "L13,292.06 a month in a small business, on a 44-hour week, our arithmetic",
         "intro": "At the dump, people count pounds and lempiras, never hours. Turn the pounds into an hour of work.",
         "optLabel": "What is sold, and where",
         "options": [
            {"label": "Cardboard, sold at the dump (2022)", "price": 0.20, "mark": "care", "text": "L0.20 a pound, from one recycler. Fifteen pounds of cardboard bought one L3 egg.", "src": "El Heraldo, May 2022 (Tegucigalpa packet)"},
            {"label": "Plastic bottles, sold at the dump (2022)", "price": 1.50, "mark": "care", "text": "L1–2 a pound; this uses the middle (our arithmetic).", "src": "El Heraldo, May 2022 (Tegucigalpa packet)"},
            {"label": "Cardboard, at a collection center (2023)", "price": 0.75, "mark": "care", "text": "L0.50–1 a pound, one step up the chain; this uses the middle (our arithmetic).", "src": "El Heraldo, Mar 2023", "url": "https://www.elheraldo.hn/elheraldoplus/interactivos/honduras-pierde-millones-de-lempiras-al-solo-reciclar-el-5-de-la-basura-que-se-genera-EN12796828"},
            {"label": "Plastic bottles, at a collection center (2023)", "price": 3, "mark": "care", "text": "L3 a pound, one step up the chain.", "src": "El Heraldo, Mar 2023", "url": "https://www.elheraldo.hn/elheraldoplus/interactivos/honduras-pierde-millones-de-lempiras-al-solo-reciclar-el-5-de-la-basura-que-se-genera-EN12796828"}],
         "price": {"min": 0.1, "max": 15, "step": 0.05},
         "pace": {"def": 10, "min": 1, "max": 60, "step": 1, "label": "Pounds sorted in an hour (your estimate)", "note": "No one publishes how many pounds a person sorts in an hour. Set your own estimate and say so."},
         "after": "Every pound is weighed by the buyer, at the buyer's price. Nobody counts the hours, so the pay never has to look like a wage."}
    sps_piece = dict(copy.deepcopy(teg_piece), minHour=round(12930.07 / (44 * 52 / 12), 2), minText="the maquila minimum, L12,930.07 a month, on a 44-hour week, our arithmetic",
         intro="Plastic is sold by the pound. In four years the price fell by about half. Same work, half the pay.",
         options=[{"label": "Plastic bottles, street collection, 2022", "price": 10.5, "mark": "care", "text": "About L10.50 a pound in 2022, from one recycling businessman.", "src": "La Prensa, Sept 2026", "url": "https://www.laprensa.hn/sanpedro/plastico-reciclado-pierde-mitad-valor-falta-demanda-GG32160512"},
                  {"label": "Plastic bottles, street collection, Sept 2026", "price": 5, "mark": "care", "text": "About L5 a pound in Sept 2026, as world demand for recycled plastic fell.", "src": "La Prensa, Sept 2026", "url": "https://www.laprensa.hn/sanpedro/plastico-reciclado-pierde-mitad-valor-falta-demanda-GG32160512"}],
         after="The price follows world demand for recycled plastic. Nobody in El Ocotillo sets it, and no deposit law puts a floor under it.")
    sps_piece["pace"]["def"] = 5
    T['honduras-teg']['interactive']['FLOOR'] = floor("Work with no floor: Tegucigalpa and Denver",
        "Three in four Honduran workers are informal. What does that take away, and what does a pound of cardboard pay by the hour?",
        "Informal work in Honduras", hn_rates + [{"big": "L9,776", "text": "a month is the average income of self-employed Hondurans (2026); domestic workers average L5,628.", "src": "INE EPHPM via E&N, Sept 2026", "url": "https://www.revistaeyn.com/empresasymanagement/ingreso-laboral-en-honduras-crece-69-pero-pobreza-alcanza-a-611-de-hogares-FA32105653"}],
        hn_here, teg_piece,
        {"cur": "L", "pay": {"monthly": 9776, "min": 1000, "max": 30000, "step": 100, "text": "Average monthly income of self-employed workers in Honduras, L9,776 (2026).", "src": "INE EPHPM via E&N, Sept 2026", "url": "https://www.revistaeyn.com/empresasymanagement/ingreso-laboral-en-honduras-crece-69-pero-pobreza-alcanza-a-611-de-hogares-FA32105653"}},
        {"text": "Families pool incomes across several informal jobs; women run corner stores (pulperías) from their homes; neighbors lend.", "src": "Tegucigalpa packet, Barrier 3"},
        "Try the dump price, then the collection-center price for the same cardboard. The step up the chain is worth more than any amount of extra effort, and the people at the dump can't take it.",
        "If you could change one thing for a picker, the price, the buyer or a floor under bad weeks, which would you choose and why?")
    T['honduras-sps']['interactive']['FLOOR'] = floor("Work with no floor: San Pedro Sula and Denver",
        "Three in four Honduran workers are informal. What does that take away, and what happens when the price of plastic halves?",
        "Informal work in Honduras", hn_rates + [{"big": "L11,587", "text": "a month is the average for independent workers in San Pedro Sula (2025); domestic workers and apprentices earn under L10,000.", "src": "INE EPHPM via La Prensa, Apr 2026", "url": "https://www.laprensa.hn/premium/desempleo-subempleo-golpea-138-mil-personas-san-pedro-sula-GF30355605"}],
        hn_here, sps_piece,
        {"cur": "L", "pay": {"monthly": 11587, "min": 1000, "max": 30000, "step": 100, "text": "Average monthly income of independent workers in San Pedro Sula, L11,587 (2025).", "src": "INE EPHPM via La Prensa, Apr 2026", "url": "https://www.laprensa.hn/premium/desempleo-subempleo-golpea-138-mil-personas-san-pedro-sula-GF30355605"}},
        {"text": "Families pool a maquila wage with informal income and money sent from abroad.", "src": "San Pedro Sula packet, Barrier 5"},
        "Switch between 2022 and 2026. Nothing about the work changed; only a price set far away. A worker paid by the hour would have had the same wage both years.",
        "Who carries the risk when a world price falls: the picker, the buyer or the exporter? Who should?")

    # ---------------- DR ----------------
    dr_src = {"src": "Banco Central, ENCFT, via Revista Mercado, May 2026", "url": "https://revistamercado.do/money-invest/republica-dominicana/record-y-realidad-rd-alcanza-5-2-millones-de-trabajadores-pero-la-informalidad-no-da-tregua/"}
    T['dr']['interactive']['FLOOR'] = floor("Work with no floor: the campo and Denver",
        "More than half of Dominican workers are informal. What does that take away, and what does a quintal of cacao pay by the hour?",
        "Informal work in the campo",
        [{"big": "54.1%", "text": "of employed Dominicans were informal in early 2026, and 82.7% of the year's net new jobs were informal.", **dr_src}],
        here_set("the social security system", dr_src,
                 health=("Depends", "Not through work. A subsidized public plan covers families on the poverty register, but it is paid far less per person than the workers' plan.", {"src": "DR packet, Barrier 4", "mark": "care"}),
                 office=(False, "A painter paid for four days of five has no office to call.", {"src": "DR packet, Barrier 5"})),
        {"cur": "RD$", "unit": "quintal of cacao", "units": "quintals", "minHour": round(714.60 / 8, 2), "minText": "the field workers' minimum, RD$714.60 for an 8-hour day",
         "intro": "A cacao grower learns the price on the day of sale. Turn a quintal into hours of work.",
         "optLabel": "Which year's price",
         "options": [{"label": "Farm-gate price, May 2026", "price": 7500, "text": "RD$7,000–8,000 a quintal; this uses the middle (our arithmetic).", "src": "El Día, May 2026", "url": "https://eldia.com.do/precio-del-cacao-cae-hasta-un-60-y-preocupa-al-sector-exportador/"},
                     {"label": "Farm-gate price, a year earlier", "price": 25000, "text": "RD$20,000–30,000 a quintal; this uses the middle (our arithmetic).", "src": "El Día, May 2026", "url": "https://eldia.com.do/precio-del-cacao-cae-hasta-un-60-y-preocupa-al-sector-exportador/"}],
         "price": {"min": 1000, "max": 40000, "step": 250},
         "pace": {"inv": True, "def": 80, "min": 10, "max": 400, "step": 5, "label": "Hours of work for one quintal (your estimate)", "note": "Pruning, harvest, fermenting and drying, over a season. No source gives it. Set your own, and leave out what the inputs cost."}},
        {"cur": "RD$", "pay": {"monthly": 16993.20, "min": 2000, "max": 40000, "step": 250, "mark": "care", "text": "The lowest legal monthly minimum (micro firms), RD$16,993.20 from Feb 2026. What informal campo work pays is not published, so set your own.", "src": "CNS via Revista Mercado", "url": "https://revistamercado.do/money-invest/daily-news/salario-minimo-en-rd/"}},
        {"text": "Neighbors work each other's land or roof in turn; rotating savings groups (san) pay out one pot a round; the colmado gives credit (fiao) until payday.", "src": "DR packet, Barrier 5"},
        "Switch the year. The same quintal, grown the same way, paid more than three times as much in hours one year as the next. A grower who signed a contract before a spike kept none of it.",
        "If you grew cacao, would you sign a contract at a fixed price? What would you gain, and what would you give up?")

    # ---------------- Panama ----------------
    pa_src = {"src": "INEC, Encuesta de Mercado Laboral, Sept 2025, Cuadro 7", "url": "https://www.inec.gob.pa/archivos/P0705547520260304112943Cuadro"}
    pa_min = {"src": "La Prensa, Jan 2026", "url": "https://www.prensa.com/economia/salario-minimo-2026-en-panama-estas-son-las-nuevas-tarifas-por-actividad-y-region/", "mark": "care"}
    T['panama']['interactive']['FLOOR'] = floor("Work with no floor: Tierras Altas and Denver",
        "Farm work in the highlands is day work, mostly without contract. What does that take away, and what does a lata of coffee pay by the hour?",
        "Informal farm work in Tierras Altas",
        [{"big": "76.0%", "text": "of non-farm workers in the Comarca Ngäbe-Buglé are informal; Chiriquí 52.7%; national 47.1% (Sept 2025). Farm work is not even in this count.", **pa_src},
         {"big": "25.1%", "text": "of Indigenous people in Panama are covered by social security (CSS), by the 2023 census as reported secondhand.", "src": "Guerra & Rodríguez 2026, citing La Estrella", "mark": "care"}],
        here_set("the CSS", {"src": "Panama packet, Barrier 3"},
                 minw=(False, "Agriculture's minimum is $1.64 an hour at small farms, but spoken, informal farm work often sits outside it.", pa_min),
                 old=(False, "No CSS contributions. A minimum pension of $144 is planned for people without enough of them.", {"src": "Panama packet, 2c", "mark": "care"}),
                 office=(False, "A worker hurt the week before payday has no claim and no record of what was owed.", {"src": "Panama packet, Barrier 3"})),
        {"cur": "$", "unit": "lata of coffee", "units": "latas", "minHour": 1.64, "minText": "the farm minimum at small farms, $1.64 an hour",
         "intro": "Coffee pickers are paid by the lata (a can of picked cherries), not by the hour. Turn the latas into an hour of work.",
         "options": [{"label": "Coffee picked, per lata", "price": 2.92, "mark": "yours", "text": "No source publishes what a lata pays in Tierras Altas. This starts at the price that would match the farm minimum ($13.12 for an 8-hour day) at 4.5 latas a day (our arithmetic). Find the real price.", "src": "Panama packet, Barriers 2 and 3"}],
         "price": {"min": 0.25, "max": 8, "step": 0.05},
         "pace": {"def": 0.56, "min": 0.1, "max": 3, "step": 0.01, "label": "Latas picked in an hour (your estimate)", "note": "One worker reported 4–5 latas a day in Panama and 15–20 in Costa Rica, where the harvest is heavier (an anecdote, time unclear)."}},
        {"cur": "$", "pay": {"monthly": 341, "min": 50, "max": 1500, "step": 5, "mark": "care", "text": "The farm minimum, $1.64 an hour × 8 hours × 26 days (our arithmetic). Ngäbe workers reported farm cleaning paying about $13 a day.", **pa_min}},
        {"text": "Whole families travel for the harvest, often to Costa Rica for four to six months, so more hands earn.", "src": "Panama packet, Barriers 1 and 4"},
        "Panama uses the dollar, so the numbers look familiar. They aren't: a full day at the farm minimum is less than one hour at Denver's minimum.",
        "What would a coffee picker need to know before the harvest to bargain for a fair price per lata? Who has that information?")

    # ---------------- Tijuana (both) ----------------
    tj_src = {"src": "INEGI, ENOE results by city, Q1 2026", "url": "https://www.inegi.org.mx/contenidos/programas/enoe/15ymas/doc/resultados_ciudades_enoe_2026_trim1.pdf"}
    tj = floor("Work with no floor: Tijuana and Denver",
        "One in three Tijuana workers is informal. What does that take away, and what does selling from a cart pay by the hour?",
        "Informal work in Tijuana",
        [{"big": "36.6%", "text": "of Tijuana workers are informal (Q1 2026), below the 43.4% average for 39 Mexican cities.", **tj_src},
         {"big": "43.0%", "text": "of Tijuana workers were unemployed, underemployed or in critical conditions such as 35+ hours at up to one minimum wage (Q1 2026), up from 33.7%.", **tj_src}],
        here_set("the IMSS", tj_src, health=("Not through work", "IMSS covers contributors; IMSS-Bienestar serves people without it.", {"src": "Zeta Tijuana", "url": "https://zetatijuana.com/2023/11/imss-bienestar-bc-inicia-rebasado-y-sin-recursos/"})),
        {"cur": "MX$", "unit": "item sold", "units": "items", "minHour": round(440.87 * 7 / 48, 2), "minText": "440.87 pesos a day on a 48-hour week, our arithmetic",
         "intro": "A vendor counts sales, not hours. Turn the sales into an hour of work, after the cost of the spot.",
         "options": [{"label": "Food or goods from a cart or stall (your estimate)", "price": 25, "mark": "yours", "text": "INEGI counts vendors but not what they earn; there is no Tijuana figure. Set the profit on one sale, after ingredients.", "src": "Tijuana packet, Barrier 2"}],
         "price": {"min": 2, "max": 150, "step": 1},
         "pace": {"def": 6, "min": 1, "max": 40, "step": 1, "label": "Sales in an hour (your estimate)", "note": "Count the slow hours too: setting up, waiting, packing away."},
         "cost": {"def": 0, "min": 0, "max": 1500, "step": 50, "label": "A fee for the spot, per day", "note": "Officials acknowledged 60–70 complaints of vendors charged 200–1,500 pesos for a spot (allegations).", "src": "Zeta Tijuana, Dec 2025", "url": "https://zetatijuana.com/2025/12/675-mil-personas-en-la-informalidad-sobreruedas-sin-permisos/"}},
        {"cur": "MX$", "pay": {"monthly": 6700, "min": 1000, "max": 30000, "step": 250, "mark": "care", "text": "In Baja California 31.5% of workers earned up to one minimum wage and 30.4% did not report their pay (Q2 2025). This starts at half the minimum; set your own.", "src": "INEGI ENOE, Baja California", "url": "https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2025/enoe/enoe2025_08_BC.pdf"}},
        {"text": "Vendors organize in market associations; families run tandas, rotating savings circles where each member pays in and one takes the pot.", "src": "Tijuana packet, Barrier 2"},
        "Many vendors earn more an hour than a factory pays, on the days they sell. Part 3 is the other half: no one pays them on the days they can't.",
        "Would you rather have the vendor's better days or the factory's steady floor? What would make you switch?")
    for tid in ('tijuana-toe', 'tijuana-doc'):
        T[tid]['interactive']['FLOOR'] = copy.deepcopy(tj)

    # ---------------- Hours of work with real incomes ----------------
    def hours(title, question, people, place, notice, yourCall):
        return {"kind": "HoursOfWork", "title": title, "question": question, "people": people, "rides": 44, "notice": notice, "yourCall": yourCall,
                "places": [place, copy.deepcopy(DEN_PLACE)]}
    peru['interactive']['HOURS'] = hours("What the pay has to cover: Quispicanchi and Denver",
        "How much of a rural Peruvian income does food alone take? Compare it with Denver's food, rent and bus at the minimum wage.", 5,
        {"id": "pe", "label": "Quispicanchi (rural Cusco)", "cur": "S/", "month": 208,
         "pays": [{"label": "Average income from work, rural Peru", "monthly": 918.4, "note": "S/918.4 a month (Apr 2024–Mar 2025).", "src": "INEI (Peru packet, 2c)"},
                  {"label": "The minimum wage (one full-time earner)", "monthly": 1230, "note": "S/1,230 a month since October 2026, which most rural workers never touch.", "src": "D.S. 015-2026-TR", "url": "https://img.lpderecho.pe/wp-content/uploads/2026/09/DS-015-2026-TR-LPDerecho.pdf"},
                  custom(500, 50, 3000, 10, "Set a month's income from farm work, weaving or day labor.")],
         "food": {"pp": 260, "short": "Food", "lab": "Food at Peru's extreme-poverty line", "text": "INEI's basic food basket: S/260 a person a month (2025). Below it is extreme poverty.", "src": "INEI via El Peruano", "url": "https://elperuano.pe/noticia/295035-inei-pobreza-se-redujo-en-19-en-el-2025-y-afecta-al-257-de-peruanos"},
         "rent": None, "bus": None},
        "The average rural income from work buys the food basket for about three and a half people, with nothing left for anything else. Most rural families own an adobe house and walk, so there is no rent or bus here. Their cushion is the farm itself.",
        "If the food basket takes the whole income, what pays for school, a doctor or seed? Where does that money come from?")
    hn_food = {"pp": 5367.2, "short": "The basic basket", "lab": "Basic basket", "text": "INE: L5,367.20 a person a month, urban Honduras (2025).", "src": "INE Honduras", "url": "https://ine.gob.hn/wp-content/uploads/2025/11/ResultadosMedicionPobreza18nov2025.pdf"}
    T['honduras-teg']['interactive']['HOURS'] = hours("What the pay has to cover: Tegucigalpa and Denver",
        "What share of a month's pay does the basic basket take for a household in Tegucigalpa? Compare it with Denver.", 4,
        {"id": "tg", "label": "Tegucigalpa", "cur": "L", "month": 44 * 52 / 12,
         "pays": [{"label": "Average income, self-employed", "monthly": 9776, "note": "L9,776 a month (2026).", "src": "INE EPHPM via E&N, Sept 2026", "url": "https://www.revistaeyn.com/empresasymanagement/ingreso-laboral-en-honduras-crece-69-pero-pobreza-alcanza-a-611-de-hogares-FA32105653"},
                  {"label": "Average income, domestic workers", "monthly": 5628, "note": "L5,628 a month (2026).", "src": "INE EPHPM via E&N, Sept 2026", "url": "https://www.revistaeyn.com/empresasymanagement/ingreso-laboral-en-honduras-crece-69-pero-pobreza-alcanza-a-611-de-hogares-FA32105653"},
                  {"label": "The minimum wage (small business)", "monthly": 13292.06, "note": "L13,292.06 a month (2026); 44.75% of wage earners were paid less in 2025.", "src": "STSS via El Heraldo", "url": "https://www.elheraldo.hn/economia/casi-870-000-trabajadores-privados-no-reciben-salario-minimo-honduras-AA31572211"},
                  custom(6000, 500, 30000, 100, "Set a month's pay, for example a picker's at the dump.")],
         "food": hn_food, "rent": None,
         "bus": {"fare": 13, "text": "L13 a ride in Tegucigalpa and Comayagüela, held there by a government subsidy (2026).", "src": "El Heraldo, Jul 2026", "url": "https://www.elheraldo.hn/tegucigalpa/transportistas-advierten-mantener-pasaje-depende-pago-subsidio-FF31438481"}},
        "The basic basket for four costs more than twice what the average self-employed worker earns. Even the minimum wage, which many never see, doesn't cover it. That is why households need several earners, including teenagers.",
        "Who in a Tegucigalpa household would have to earn for the basket to be covered? What would they stop doing?")
    T['honduras-sps']['interactive']['HOURS'] = hours("What the pay has to cover: San Pedro Sula and Denver",
        "What share of a month's pay does the basic basket take for a household in San Pedro Sula? Compare it with Denver.", 4,
        {"id": "sp", "label": "San Pedro Sula", "cur": "L", "month": 44 * 52 / 12,
         "pays": [{"label": "Average income, independent workers", "monthly": 11587, "note": "L11,587 a month in San Pedro Sula (2025).", "src": "INE EPHPM via La Prensa, Apr 2026", "url": "https://www.laprensa.hn/premium/desempleo-subempleo-golpea-138-mil-personas-san-pedro-sula-GF30355605"},
                  {"label": "The maquila minimum wage", "monthly": 12930.07, "note": "L12,930.07 a month in 2026, the lowest formal-sector minimum.", "src": "El Heraldo, Dec 2025", "url": "https://www.elheraldo.hn/economia/salario-minimo-pagara-2026-maquila-hondurena-GJ28650622"},
                  custom(6000, 500, 30000, 100, "Set a month's pay, for example from sorting plastic.")],
         "food": hn_food, "rent": None,
         "bus": {"fare": 15, "text": "Many San Pedro Sula buses began charging L15 in January 2026, up from L13, without official approval.", "src": "La Prensa, Jan 2026", "url": "https://www.laprensa.hn/fotogalerias/san-pedro-enfotos/honduras-13-15-lempiras-transportistas-suben-pasaje-sin-autorizacion-oficial-sps-AK28995599"}},
        "Even the formal maquila minimum covers only about 60% of the basic basket for four. Informal pay covers less. Families pool a maquila wage, informal work and money sent from abroad.",
        "How many earners does the household need? Where would the money from abroad fit in?")
    T['dr']['interactive']['HOURS'] = hours("What the pay has to cover: the campo and Denver",
        "What share of a month's pay does the basic basket for the lowest-income households take? Compare it with Denver.", 4,
        {"id": "do", "label": "Northern Cibao campo", "cur": "RD$", "month": 208,
         "pays": [{"label": "The field workers' minimum (26 days)", "monthly": round(714.60 * 26, 2), "note": "RD$714.60 for an 8-hour day, × 26 days (our arithmetic).", "src": "CNS via Revista Mercado", "url": "https://revistamercado.do/money-invest/daily-news/salario-minimo-en-rd/"},
                  {"label": "The micro-firm minimum wage", "monthly": 16993.20, "note": "RD$16,993.20 a month from Feb 2026, the lowest legal monthly minimum.", "src": "CNS via Revista Mercado", "url": "https://revistamercado.do/money-invest/daily-news/salario-minimo-en-rd/"},
                  custom(10000, 1000, 40000, 250, "Informal campo pay isn't published. Set your own and say so.")],
         "food": {"hh": 29489.84, "short": "The basic basket", "lab": "Basic basket, lowest-income fifth of households", "text": "Banco Central: RD$29,489.84 a month for a household in the lowest-income fifth, food and other needs (May 2026).", "src": "BCRD via Revista Mercado", "url": "https://revistamercado.do/nacional/cuanto-cuesta-vivir-en-rd-segun-tu-region-e-ingresos-la-canasta-basica-en-mayo-2026/"},
         "rent": None, "bus": None},
        "The basket here is the Banco Central's own measure for the poorest fifth of households, and it already includes more than food. One field worker at the legal minimum covers less than two-thirds of it.",
        "What fills the gap: a second earner, money from New York or Madrid, or credit at the colmado? What does each one cost?")
    T['panama']['interactive']['HOURS'] = hours("What the pay has to cover: Tierras Altas and Denver",
        "Can a month at the farm minimum feed a household? Compare it with Denver, in the same dollars.", 4,
        {"id": "pa", "label": "Tierras Altas, Chiriquí", "cur": "$", "month": 208,
         "pays": [{"label": "The farm minimum (26 days of 8 hours)", "monthly": 341, "mark": "care", "note": "$1.64 an hour at small farms (2026–27) × 8 × 26 (our arithmetic). Spoken, informal farm work often pays outside it.", "src": "La Prensa, Jan 2026", "url": "https://www.prensa.com/economia/salario-minimo-2026-en-panama-estas-son-las-nuevas-tarifas-por-actividad-y-region/"},
                  custom(250, 50, 1500, 5, "Set a month of day work, for example farm cleaning reported at about $13 a day.")],
         "food": {"hh": 345.20, "short": "Food", "lab": "The basic food basket (urban, outside the capital)", "text": "MEF: $345.20 a month to feed an average household of 3.6 people in urban areas outside the capital (June 2026). No rural Chiriquí basket is published.", "src": "MEF, June 2026", "url": "https://www.mef.gob.pa/wp-content/uploads/2026/08/MEF-DAES-Canasta-Basica-Familiar-de-Alimentos-JUNIO-2026.pdf"},
         "rent": None, "bus": None},
        "A full month at the farm minimum does not quite buy the food basket alone. Same currency as Denver, so no exchange rate hides it.",
        "If one month of farm work can't feed the household, what does the family do the rest of the year?")
