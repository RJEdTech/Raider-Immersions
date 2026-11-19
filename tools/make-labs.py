"""Write labs/<id>.json for every trip from one place, so the shared Denver pieces stay identical.
Every constant here is copied from that trip's research packet (2c table and §5 labs), with its source."""
import json, copy, os, sys
ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..")
peru = json.load(open(os.path.join(ROOT, 'labs', 'peru.json')))
E = peru['interactive']['E']
DEN_SAL, DEN_LOW = E['families'][1], E['families'][2]

# Denver run of every loan lab: APRs, so monthly rate = APR / 12
DEN_LOAN = {
    "currency": "$", "amount": 400,
    "options": [
        {"label": "A credit card", "rate": 0.2119, "apr": True, "needs": ["papers"], "src": "Federal Reserve G.19, Q3 2026"},
        {"label": "A small loan under Colorado's cap", "rate": 0.36, "apr": True, "needs": [], "src": "Prop 111 (2018): payday loans capped at 36% a year"},
        {"label": "Family who can lend", "rate": 0, "needs": ["group"], "src": "Depends on who you know. 63% of U.S. adults could cover $400 in cash."}],
    "gates": [{"id": "papers", "label": "Has a credit history"}, {"id": "group", "label": "Has family who can lend"}]}
peru['interactive']['LOAN']['denver'] = copy.deepcopy(DEN_LOAN)


def den(amount=400):
    d = copy.deepcopy(DEN_LOAN); d['amount'] = amount; return d


def obw(there, shocks, families_after=None, note=None):
    fams = (there if isinstance(there, list) else [there]) + (families_after or [DEN_SAL, DEN_LOW])
    c = {"kind": "OneBadWeek", "families": fams, "shocks": [dict(zip(('id', 'label', 'weeks', 'extra'), s)) for s in shocks]}
    if note: c['note'] = note
    return c


def loan(cur_amount, lo, hi, step, options, gates, denver, months=12):
    return {"kind": "LoanCost", "amount": cur_amount, "min": lo, "max": hi, "step": step, "months": months,
            "options": options, "gates": gates, "denver": denver}


def o(label, needs, src, rate=None, **kw):
    d = {"label": label, "needs": needs, "src": src}
    if rate is not None: d['rate'] = rate
    d.update(kw); return d


CARD_M = 0.2119 / 12
LIFE_LOW = "31% of U.S. households earning under $50,000 own life insurance (LIMRA 2024)."
G_GROUP = {"id": "group", "label": "Belongs to a savings group"}
G_FAMILY = {"id": "group", "label": "Has a relative who can lend"}

T = {}

T['quito'] = dict(
    name="Quito, Ecuador", short="Quito", region="North Quito, with The Center: A Family of Families", ft=9350, lat=-0.18, lon=-78.47,
    lang="Spanish", partner={"name": "The Center: A Family of Families", "url": "https://www.c4wf.org/our-work"}, currency="$",
    interactive={
        "A": obw(dict(id="there", label="A Center family in north Quito: two informal earners", leaveWeeks=0, leaveShare=0,
                      leaveNote="No paid leave: 51.9% of Quito's employed have no social security (2025). IESS sick pay (75% from day 4) reaches only contributors.",
                      health="Free on paper, but in Dec 2025 Quito's public hospitals stocked about 40–52% of the medicines they should.",
                      loanOptions=[{"label": "A street lender", "monthly": 0.20, "note": "Street lenders charge about 20% a month (press reports; read with care)."},
                                   {"label": "Microcredit, if a lender will take them", "rate": 0.192, "note": "Microcredit averaged 19.20% a year (BCE, June 2026), but needs papers and documented income."}],
                      lifeInsLikely=False, lifeInsNote="About 2% of low- and middle-income Ecuadorians have any microinsurance (2025).", savings=1),
                 [("injury", "The earner breaks an arm", 6, 1), ("power", "The power goes out 14 hours a day for a month", 2, 1),
                  ("birth", "A baby is born early", 12, 2), ("vacuna", "The stall is told to pay a vacuna (extortion)", 0, 3),
                  ("death", "The earner dies", 26, 2)]),
        "E": loan(400, 100, 3000, 50, [
            o("A social-housing loan (for the house)", ["papers", "income", "title"], "Social-interest housing rate, 2026: only with title and documents", 0.0499),
            o("Microcredit at the average rate", ["papers", "income"], "BCE, June 2026", 0.192),
            o("Microcredit at the legal maximum", ["papers"], "JPRF, 2026", 0.2823),
            o("A street lender", [], "Press reports: about 20% a month, collected daily (read with care)", monthly=0.20),
            o("A savings group", ["group"], "No interest, but only what the group has saved", 0)],
            [{"id": "papers", "label": "Has an Ecuadorian ID or a visa"}, {"id": "income", "label": "Has documented income (a RUC tax number or IESS)"},
             {"id": "title", "label": "Has title to the house"}, G_GROUP], den())})

T['memphis'] = dict(
    name="Memphis, Tennessee", short="Memphis", region="Memphis, Tennessee, with Serve901", ft=337, lat=35.15, lon=-90.05, lang="English",
    partner={"name": "Serve901", "url": "https://serve901-memphis.squarespace.com/your-guides"}, currency="$",
    interactive={
        "D": obw(dict(id="there", label="A Memphis family: one parent works full-time in a warehouse", leaveWeeks=0, leaveShare=0,
                      leaveNote="Tennessee has no paid sick or family leave law; it depends on the employer. 61% of the lowest-paid quarter of U.S. private workers have paid sick leave (BLS 2026).",
                      health="Tennessee has not expanded Medicaid. TennCare covers a parent only up to 100% of poverty ($2,277 a month for three). Uninsured: 9.7%.",
                      loanOptions=[{"label": "A title loan on the car", "monthly": 0.22, "note": "Title loans: 2% a month plus up to 20% per 30-day renewal (TDFI)."},
                                   {"label": "A flex loan", "monthly": 2.795 / 12, "note": "Flex loans: up to 279.5% APR on lines to $4,000 (ProPublica)."},
                                   {"label": "A credit card, if the credit file allows", "monthly": CARD_M, "note": "Average card rate: 21.19% (Federal Reserve, Q3 2026)."}],
                      lifeInsLikely=False, lifeInsNote="No Memphis figure. " + LIFE_LOW, savings=1),
                 [("injury", "The earner breaks a leg", 8, 1), ("hospital", "A child is in the hospital for asthma", 1, 3),
                  ("car", "The car dies", 1, 3), ("filing", "The complex files on you after one late payment", 0, 3),
                  ("death", "The earner dies", 26, 2)]),
        "E": loan(500, 100, 3000, 50, [
            o("A credit card", ["credit"], "Federal Reserve G.19, Q3 2026", 0.2119, apr=True),
            o("A payday loan", ["bank"], "Tenn. Code § 45-17-112 (2010 text, read with care): fee up to 15%, $500 most, 31 days; about 391% a year (our arithmetic)", 3.91, apr=True, maxAmt=500, months=1),
            o("A flex loan", ["bank"], "ProPublica: up to 279.5% APR on lines to $4,000", 2.795, apr=True, maxAmt=4000),
            o("A title loan on the car", ["car"], "TDFI: 2% a month plus up to 20% per 30-day renewal", monthly=0.22),
            o("A relative who can lend", ["group"], "Depends on who you know", 0)],
            [{"id": "credit", "label": "Has a good credit file (no eviction judgment)"}, {"id": "bank", "label": "Has a bank account"},
             {"id": "car", "label": "Owns the car outright"}, G_FAMILY], den(500))})

ABROAD = {"id": "abroad", "label": "Has a relative abroad who can send it"}
T['honduras-sps'] = dict(
    name="El Ocotillo, San Pedro Sula, Honduras", short="San Pedro Sula", region="El Ocotillo, beside the municipal dump of San Pedro Sula", ft=200, lat=15.50, lon=-88.03,
    lang="Spanish", partner={"name": "International Samaritan", "url": "https://www.internationalsamaritan.org"}, currency="L",
    hideBarriers=[7],
    interactive={
        "A": obw(dict(id="there", label="A family in El Ocotillo: one parent sorts at the dump, one sells informally", leaveWeeks=0, leaveShare=0,
                      leaveNote="No paid leave: 74.8% of work in Honduras is informal (INE 2024). IHSS sick pay (66% from day 4) reaches only contributors.",
                      health="IHSS covers about 22% of workers; everyone else uses public hospitals and health centers.",
                      loanOptions=[{"label": "A daily lender", "monthly": 0.20, "note": "Daily lenders charge about 20% a month (2015 report; read with care)."},
                                   {"label": "Microcredit", "rate": 0.34, "note": "Microcredit to individuals: 34.0% a year (CNBS 2024)."},
                                   {"label": "A relative abroad sends it", "rate": 0, "note": "No interest, if someone abroad can send it."}],
                      lifeInsLikely=False, lifeInsNote="Under 2 individual life policies per 100 adults in Honduras (CNBS 2025; our arithmetic).", savings=1),
                 [("injury", "The earner is injured", 6, 1), ("flood", "The house floods", 2, 6), ("birth", "A baby is born early", 12, 2),
                  ("hospital", "A child is in the hospital", 2, 3), ("deported", "The earner is deported", 26, 3), ("death", "The earner dies", 26, 2)]),
        "E": loan(10000, 1000, 50000, 500, [
            o("A bank loan", ["papers", "income", "title"], "BCH, June 2026: loans up to L500,000", 0.2011),
            o("Microcredit", ["papers"], "CNBS 2024", 0.34),
            o("A daily lender", [], "About 20% a month (2015 report, read with care)", monthly=0.20),
            o("A relative abroad sends it", ["abroad"], "No interest, if someone can send it", 0)],
            [{"id": "papers", "label": "Has a DNI and a bank account"}, {"id": "income", "label": "Has documented income (IHSS or a contract)"},
             {"id": "title", "label": "Has full title to the lot"}, ABROAD], den())},
    replace=[["; whether the store is already paying extortion", ""]])

T['honduras-teg'] = dict(
    name="Buen Samaritano, Tegucigalpa, Honduras", short="Tegucigalpa", region="Buen Samaritano, a community beside the Tegucigalpa dump", ft=3300, lat=14.07, lon=-87.19,
    lang="Spanish", partner={"name": "International Samaritan", "url": "https://www.internationalsamaritan.org"}, currency="L",
    hideBarriers=[6],
    interactive={
        "A": obw(dict(id="there", label="A Buen Samaritano family: the mother picks recyclables at the dump", leaveWeeks=0, leaveShare=0,
                      leaveNote="Pickers are no one's employees: 74.8% of work is informal (INE 2024). IHSS pays 66% from day 4, only to contributors.",
                      health="At Hospital Escuela, the capital's main public hospital, relatives reported buying their own medicines and surgical supplies (July 2026).",
                      loanOptions=[{"label": "A street lender", "monthly": 0.20, "note": "Street lenders charge about 20% a month, collected daily (2022 report; read with care)."},
                                   {"label": "A bank, if the family has a DNI, a title and provable income", "rate": 0.2011, "note": "Bank loans up to L500,000: 20.11% a year (BCH, June 2026)."},
                                   {"label": "The relative abroad sends it", "rate": 0, "note": "No interest, as long as the money keeps coming."}],
                      lifeInsLikely=False, lifeInsNote="176 individual life policies per 10,000 adults in Honduras (CNBS 2025).", savings=1),
                 [("injury", "The earner is hurt and can't work for three weeks", 3, 1), ("water", "The water stops for twelve days", 0, 1),
                  ("birth", "A baby is born early", 12, 2), ("deported", "The uncle who sends money is deported", 0, 6), ("death", "The earner dies", 26, 2)]),
        "E": loan(5000, 500, 30000, 500, [
            o("A bank loan", ["papers", "title", "income"], "BCH via El Heraldo, June 2026", 0.2011),
            o("Banhprovi MyPE+ (state micro-business line)", ["papers", "biz"], "La Prensa, 2025: registered businesses only", 0.22),
            o("A street lender", [], "About 20% a month, collected daily (2022 report, read with care)", monthly=0.20),
            o("A relative abroad sends it", ["abroad"], "No interest, if someone can send it", 0)],
            [{"id": "papers", "label": "Has a DNI"}, {"id": "title", "label": "Has title to the lot"},
             {"id": "income", "label": "Has provable income (IHSS or a contract)"}, {"id": "biz", "label": "Has a registered business"}, ABROAD], den())})

T['dr'] = dict(
    name="The Cibao campos, Dominican Republic", short="Dominican Republic", region="Rural campos of the northern Cibao, from the Creighton-ILAC center in Santiago de los Caballeros",
    ft=600, lat=19.45, lon=-70.70, lang="Spanish", partner={"name": "Creighton University ILAC", "url": "https://www.creighton.edu/geo/ilac/encuentroabouttheilaccenter"}, currency="RD$",
    interactive={
        "D": obw(dict(id="there", label="A farm family in a Cibao campo", leaveWeeks=0, leaveShare=0,
                      leaveNote="No paid leave: 54.1% of Dominican workers are informal (Q1 2026). Paid maternity (14 weeks) reaches only the formal regime.",
                      health="Covered by SENASA's subsidized plan, but specialists and surgery are in Santiago.",
                      loanOptions=[{"label": "A prestamista (moneylender)", "monthly": 0.20, "note": "Prestamistas: about 20% a month, interest only (read with care)."},
                                   {"label": "Bank microcredit", "rate": 0.358, "note": "Microcredit averaged 35.8% a year (Superintendencia de Bancos, March 2026)."},
                                   {"label": "Banco Agrícola, if they can reach it", "rate": 0.08, "note": "Banco Agrícola lends at 8% (June 2025), if the family can reach it and has title."}],
                      lifeInsLikely=False, lifeInsNote="Insurance of all kinds came to 1.4% of GDP, half the Latin American average (2022; read with care).", savings=1),
                 [("injury", "The earner breaks a leg", 8, 1), ("storm", "A hurricane destroys the crop (hail totals the car here)", 0, 8),
                  ("birth", "A baby is born early", 12, 2), ("surgery", "A child needs surgery", 2, 4), ("death", "The earner dies", 26, 2)]),
        "E": loan(100000, 10000, 300000, 5000, [
            o("Banco Agrícola", ["title", "reach"], "Banco Agrícola, June 2025 (7% for women-led businesses, 0% for young producers)", 0.08),
            o("Bank microcredit", ["papers", "income"], "Superintendencia de Bancos, March 2026", 0.358),
            o("A credit card", ["papers", "income"], "Superintendencia de Bancos, March 2026", 0.578),
            o("A prestamista", [], "About 20% a month, interest only until the loan is paid (read with care)", monthly=0.20),
            o("A san (rotating savings)", ["san"], "No interest, but you wait for your turn, and storms don't wait", 0)],
            [{"id": "papers", "label": "Has a cédula (national ID)"}, {"id": "title", "label": "Has a registered land title"},
             {"id": "income", "label": "Has documented income (a formal job or a crop contract)"},
             {"id": "reach", "label": "Can reach a Banco Agrícola office"}, {"id": "san", "label": "Has a san turn coming up"}], den())})

TIJ = dict(ft=70, lat=32.53, lon=-117.02, lang="Spanish and English", currency="MX$")
T['tijuana-toe'] = dict(TIJ,
    name="Tijuana, Baja California (Theology of Encounter)", short="Tijuana", region="Tijuana and the border, crossing on foot from San Diego",
    interactive={
        "B": obw(dict(id="there", label="A family in a Tijuana canyon colonia: both parents work informally", leaveWeeks=0, leaveShare=0,
                      leaveNote="No paid leave: 36.6% of Tijuana's employed work informally (Q1 2026). Leave rules for formal workers are still being checked.",
                      health="Without social security, care is through IMSS-Bienestar, the federal system.",
                      loanOptions=[{"label": "A small bank loan, if they have an account", "rate": 0.565, "note": "Bank loans up to MX$5,000 averaged 56.5% a year (Banxico, data to Feb 2026)."},
                                   {"label": "Group microcredit", "rate": 0.731, "note": "Group microcredit: 73.1% a year (Banxico)."}],
                      lifeInsLikely=False, lifeInsNote="22.9% of Mexican adults had any insurance policy (INEGI ENIF 2024).", savings=1),
                 [("injury", "The earner is hurt at work", 6, 1), ("rain", "Winter rains crack the house (a basement floods here)", 0, 6),
                  ("birth", "A baby is born early", 12, 2), ("deported", "The earner is deported or detained", 26, 3), ("death", "The earner dies", 26, 2)]),
        "E": loan(5000, 1000, 30000, 500, [
            o("A small personal loan from a bank", ["papers", "bank"], "Banxico, data to Feb 2026: loans up to MX$5,000; interest only, before VAT and fees", 0.565, maxAmt=5000),
            o("Compartamos", ["papers"], "Banxico: MX$5,000–30,000", 0.819, minAmt=5000),
            o("Group microcredit", ["papers"], "Banxico: system-wide average", 0.731),
            o("A tanda among neighbors", ["tanda"], "No interest; it works because neighbors trust each other", 0)],
            [{"id": "papers", "label": "Has an INE voter card and a CURP"}, {"id": "bank", "label": "Has a formal job with a payroll account"},
             {"id": "tanda", "label": "Belongs to a tanda"}],
            dict(den(), gates=[{"id": "papers", "label": "Has a credit history (needs an SSN or ITIN)"}, {"id": "group", "label": "Has family who can lend"}]))})

T['tijuana-doc'] = dict(TIJ,
    name="Tijuana, Baja California (Social Documentary)", short="Tijuana (film)", region="Tijuana and the border, on the Social Documentary trip",
    partner={"name": "PeaceWorks Travel", "url": "https://peaceworkstravel.com/about-peace-works-travel/"},
    interactive={
        "A": obw([dict(id="formal", label="A Tijuana colonia family, if it hits the parent on the maquila shift (formal, IMSS)", leaveWeeks=52, leaveShare=0.6,
                       leaveBy={"birth": [12, 1.0]},
                       leaveNote="IMSS sick pay: 60% of wage from day 4 (read with care); 100% for 84 days after a birth.",
                       health="IMSS clinics and hospitals.",
                       loanOptions=[{"label": "A personal loan from a bank", "rate": 0.405, "note": "Personal loans averaged 40.5% a year (Banxico, Aug 2025)."}],
                       lifeInsLikely=False, lifeInsNote="Life-insurance coverage in Mexico: not yet sourced.", savings=1),
                  dict(id="informal", label="The same family, if it hits the parent who sells at the sobreruedas (informal)", leaveWeeks=0, leaveShare=0,
                       leaveNote="Informal: no paid leave. 36.6% of Tijuana workers are informal (Q1 2026).",
                       health="The public system (IMSS-Bienestar).",
                       loanOptions=[{"label": "A small bank loan", "rate": 0.578, "note": "Loans up to 5,000 pesos: 57.8% a year (Banxico, Aug 2025)."},
                                    {"label": "Group microcredit", "rate": 0.731, "note": "Group microcredit: 73.1% a year (Banxico, Aug 2025)."}],
                       lifeInsLikely=False, lifeInsNote="Life-insurance coverage in Mexico: not yet sourced.", savings=1)],
                 [("injury", "The earner breaks a wrist", 6, 1), ("rain", "Heavy rain damages the house", 0, 6), ("birth", "A baby is born early", 12, 2),
                  ("hospital", "A child is in the hospital for a week", 1, 3), ("deported", "The earner is detained and deported", 26, 3), ("death", "The earner dies", 26, 2)]),
        "E": loan(10000, 1000, 50000, 500, [
            o("The city loan", ["papers", "bill", "equip"], "SEDETI 2025: up to 50,000 pesos over 18 months; equipment yes, construction no", 0.03, rateText="3%", months=18),
            o("A personal loan from a bank", ["papers", "bank"], "Banxico, Aug 2025", 0.405),
            o("A small loan (up to 5,000 pesos)", ["papers"], "Banxico, Aug 2025", 0.578, maxAmt=5000),
            o("Individual microcredit", ["papers"], "Banxico, Aug 2025", 0.583),
            o("Group microcredit", ["papers"], "Banxico, Aug 2025", 0.731),
            o("A tanda", ["tanda"], "No interest, but you get the pot on your turn, not on the day the rain comes", 0)],
            [{"id": "papers", "label": "Has an INE with a Tijuana address"}, {"id": "bill", "label": "Has a utility bill in their own name"},
             {"id": "bank", "label": "Has a bank account and a payroll job"}, {"id": "equip", "label": "Is buying equipment (the city loan won't pay for construction)"},
             {"id": "tanda", "label": "Belongs to a tanda"}], den(500))})

T['jfarm'] = dict(
    name="Historic Northeast, Kansas City", short="Kansas City", region="Historic Northeast Kansas City, Missouri, with Jerusalem Farm", ft=900, lat=39.11, lon=-94.55,
    lang="English, Spanish and many more", partner={"name": "Jerusalem Farm", "url": "https://www.jerusalemfarm.org/"}, currency="$",
    interactive={
        "B": obw(dict(id="there", label="An older homeowner in the Northeast: owns her house, lives on Social Security", leaveWeeks=0, leaveShare=0, fixedIncome=True,
                      incomeNote="Her Social Security keeps coming, so time off costs her no pay. The extra costs are what hurt.",
                      leaveNote="Missouri has no state paid sick leave: it was repealed in Aug 2025.",
                      health="Medicare.",
                      loanOptions=[{"label": "A payday lender", "monthly": 3.6507 / 12, "note": "Payday: average APR 365% on an average $307 loan (Missouri Division of Finance, 2021–22)."},
                                   {"label": "Jerusalem Farm's no-interest loan", "rate": 0, "note": "No interest, but about a year's wait (LISC 2023)."}],
                      lifeInsLikely=False, lifeInsNote="No Missouri figure. " + LIFE_LOW, savings=1),
                 [("furnace", "The furnace dies in January", 0, 4), ("injury", "She falls and breaks a leg (the earner, in Denver)", 8, 2),
                  ("bill", "A $3,000 bill arrives (tax, deductible or ER)", 0, 6), ("hospital", "A family member is in the hospital for a week", 1, 3),
                  ("death", "The earner dies", 26, 2)]),
        "E": loan(2500, 500, 10000, 100, [
            o("Jerusalem Farm", [], "LISC 2023: a signed statement, no-interest loan", 0, wait="about a year"),
            o("The city repair program (a grant)", ["deed"], "KCMO: deed required", 0, wait="4–5 times more eligible applicants than funds"),
            o("A bank loan against the house", ["deed", "credit", "bank"], "LISC 2023: 8.21–9.82%, first lien, $10,000 minimum", 0.0821, apr=True, minAmt=10000, rateText="8.21–9.82% a year"),
            o("A payday lender", ["bank"], "Missouri Division of Finance 2023: average APR 365%, up to 75% of the loan in fees over renewals, $500 most", 3.65, apr=True, maxAmt=500, capTotal=0.75),
            o("A relative who can lend", ["group"], "Depends on who you know", 0)],
            [{"id": "deed", "label": "Has her own name on the deed"}, {"id": "credit", "label": "Has a good credit score"},
             {"id": "bank", "label": "Has a bank account"}, G_FAMILY], den(2500))})

sal = dict(DEN_SAL, label="A salaried RJ family in Douglas or Arapahoe County")
low = dict(DEN_LOW, label="A Denver day-labor family: one parent on hiring corners, one in hourly work",
           leaveNote="FAMLI needs $2,500 in reported wages, and job protection starts after 180 days. 62% of surveyed Denver-area day laborers had experienced wage theft (DU, 2016–17; read with care).")
T['denver'] = dict(
    name="Tennyson Center for Children, Denver", short="Denver (Tennyson)", region="Tennyson Center for Children, in Berkeley, northwest Denver", ft=5350, lat=39.78, lon=-105.04,
    lang="English and Spanish", partner={"name": "Tennyson Center for Children", "url": "https://tennysoncenter.org"}, currency="$",
    hideBarriers=[8],
    interactive={
        "B": obw([], [("crisis", "A child has a mental-health crisis and needs care for weeks", 4, 3), ("injury", "The earner is injured", 8, 1),
                      ("care", "Child care closes", 4, 0), ("rent", "The rent goes up $300", 0, 2), ("car", "The car breaks down the week of a court date", 1, 3)],
                 families_after=[sal, low],
                 note="A third household, a newly arrived migrant family in a shelter, waits until its shelter, health and work-permit rules are checked.")})

T['dc'] = dict(
    name="Washington, D.C.", short="Washington, D.C.", region="The Father McKenna Center on North Capitol Street, Washington, D.C.", ft=50, lat=38.90, lon=-77.01,
    lang="English", partner={"name": "Father McKenna Center", "url": "https://fathermckennacenter.org/"}, currency="$",
    interactive={
        "A": obw(dict(id="there", label="A renter family in Ward 8: one parent works hourly", leaveWeeks=10, leaveShare=0.9, leaveBy={"birth": [12, 0.9]},
                      leaveNote="D.C. Paid Family Leave (from Oct 2026): 10 weeks for your own illness, 12 for a new baby, 6 to care for family; 90% of pay at this wage (D.C. Code § 32-541.04), up to $1,100 a week. Federal and D.C. government workers are outside it.",
                      health="Medicaid to 138% of poverty, then Healthy DC to 200% (2026).",
                      loanOptions=[{"label": "A bank or credit union, under the 24% cap", "monthly": 0.02, "note": "D.C. caps most loans at 24% a year (D.C. Code § 28-3301), if a lender will see you."},
                                   {"label": "An online lender routing around the cap", "monthly": 1.6 / 12, "note": "Online lenders charged 160–251% until the Attorney General's settlements (OAG 2024)."}],
                      lifeInsLikely=False, lifeInsNote="No D.C. figure. " + LIFE_LOW, savings=1),
                 [("injury", "The earner breaks a leg and can't work for six weeks", 6, 1), ("birth", "A baby is born early and spends 12 days in the NICU", 12, 3),
                  ("notice", "The landlord sells and gives 30 days' notice", 0, 4), ("arrest", "A teenage son is arrested", 1, 3), ("death", "The earner dies", 26, 2)]),
        "E": loan(400, 100, 2000, 50, [
            o("A bank or credit union", ["id", "bank", "credit"], "D.C. Code § 28-3301: most loans capped at 24% a year", 0.24, apr=True, rateText="24% a year at most"),
            o("An online lender routing around the cap", ["bank"], "OAG 2024: rates of 160–251% the Attorney General sued over", 1.6, apr=True, rateText="160–251% a year"),
            o("A friend or relative", ["group"], "Depends on who you know", 0)],
            [{"id": "id", "label": "Has a valid photo ID and a fixed address"}, {"id": "bank", "label": "Has a bank account"},
             {"id": "credit", "label": "Has a credit history"}, {"id": "group", "label": "Has someone who can lend"}], den())})

T['kentucky'] = dict(
    name="Floyd County, Kentucky", short="Kentucky", region="Floyd County and the Big Sandy valley in eastern Kentucky, with Hand in Hand Ministries in Auxier", ft=700, lat=37.73, lon=-82.76,
    lang="English", partner={"name": "Hand in Hand Ministries", "url": "https://myhandinhand.org/about/"}, currency="$",
    interactive={
        "A": obw(dict(id="there", label="An older homeowner in a Floyd County hollow: fixed income, a manufactured home beside a creek", leaveWeeks=0, leaveShare=0, fixedIncome=True,
                      incomeNote="Her check keeps coming, so time off costs her no pay. The extra costs are what hurt.",
                      leaveNote="Kentucky has no state paid sick or family leave (KFF 2025).",
                      health="Medicaid is the main coverage for 38.1%; uninsured 5.2% (2024). Drive times to care: not yet sourced.",
                      loanOptions=[{"label": "A licensed installment loan", "monthly": 0.03, "note": "Installment loans: up to 3% a month under $5,000 (KRS 286.4-530)."},
                                   {"label": "A payday loan", "monthly": 3.91 / 12, "note": "Payday: $15 per $100 for two weeks, about 391% a year (our arithmetic); $600 most (KRS 286.9-100, 2026)."},
                                   {"label": "A credit card, if her credit allows", "monthly": CARD_M, "note": "Average card rate: 21.19% (Federal Reserve, Q3 2026)."}],
                      lifeInsLikely=False, lifeInsNote="No local life-insurance figure. Social Security survivor benefits reach 1,115 widow(er)s and parents and 595 children in Floyd County (Dec 2025).", savings=1),
                 [("fall", "A fall breaks a hip", 8, 4), ("flood", "The creek floods (a basement floods here)", 2, 10),
                  ("parttime", "The earner is hurt and can only work part-time", 4, 0), ("grandchild", "A grandchild comes to live with you", 0, 4),
                  ("death", "A parent dies", 26, 2)]),
        "E": loan(1000, 200, 3000, 50, [
            o("A volunteer crew (Hand in Hand, a church)", ["crew"], "Free labor", 0, wait="not yet known: ask Hand in Hand"),
            o("Borrowing against the house", ["equity", "credit"], "Near the 30-year mortgage rate, 7.11%", 0.0711, apr=True),
            o("A credit card", ["credit"], "Federal Reserve G.19, Q3 2026", 0.2119, apr=True),
            o("A licensed installment loan", ["bank"], "KRS 286.4-530: up to 3% a month under $5,000", monthly=0.03),
            o("A payday loan", ["bank"], "KRS 286.9-100 (2026): $15 per $100 per two weeks; two loans, $600 total", 3.91, apr=True, maxAmt=600, months=1, rateText="about 391% a year (our arithmetic)"),
            o("A relative who can lend", ["group"], "Depends on who you know", 0)],
            [{"id": "bank", "label": "Has a bank account"}, {"id": "credit", "label": "Has a good credit score"},
             {"id": "equity", "label": "Has equity and a clear title to the house"}, {"id": "crew", "label": "Can get a volunteer crew this year"}, G_FAMILY], den(1000))})

T['panama'] = dict(
    name="Tierras Altas, Panama", short="Panama", region="Tierras Altas, Chiriquí: Cerro Punta and Guadalupe", ft=6500, lat=8.85, lon=-82.57,
    lang="Spanish and Ngäbere", partner={"name": "AMIGOS", "url": "https://amigosinternational.org/programs/panama-tierras-altas/"}, currency="$",
    interactive={
        "A": obw(dict(id="there", label="A Ngäbe farmworker family in Paso Ancho", leaveWeeks=0, leaveShare=0,
                      leaveNote="No paid leave for informal and day workers; 76.0% of work in the comarca is informal (INEC).",
                      health="Only 25.1% of Indigenous people are covered by the CSS (Census 2023; read with care).",
                      loanOptions=[{"label": "Whoever will lend", "rate": None, "note": "Only 15.9% of Panamanian adults borrowed from a formal lender (Findex 2025). Loan rates: not yet sourced."}],
                      lifeInsLikely=False, lifeInsNote="CSS survivor benefits reach only contributors' families.", savings=1),
                 [("injury", "The earner breaks an arm", 6, 1), ("flood", "The creek floods the house", 2, 6), ("birth", "A baby is born early", 12, 2),
                  ("hospital", "A child is in the hospital", 2, 3), ("death", "The earner dies", 26, 2)]),
        "D": {"kind": "TwoWays",
              "views": [{"id": "ipm25", "label": "Multidimensional poverty, 2025", "value": 73.2, "src": "MEF, IPM 2025", "mark": "ok"},
                        {"id": "ipm22", "label": "Multidimensional poverty, 2022", "value": 81.1, "src": "MEF, IPM 2025, Anexo 1", "mark": "ok"},
                        {"id": "undp", "label": "Income poverty, 2025", "value": 78.2, "src": "UNDP 2025", "mark": "care", "caveat": "A different measure and year."},
                        {"id": "idea", "label": "Poverty, as IDEA reports it, 2026", "value": 86.5, "src": "IDEA 2026, citing INEC", "mark": "care", "caveat": "A different measure and year."}],
              "pairs": [["ipm25", "undp"], ["ipm22", "ipm25"], ["undp", "idea"]],
              "pairLabels": ["Two measures", "Two years", "Two counters"],
              "caption": "Each dot is one person out of 100 in the Comarca Ngäbe-Buglé. Every number is honest: what changed is the measure, the year, or who did the counting."}})

# ---------- Who decides for us? ----------
def dec(q, level, detail, src, url=None, mark='ok'):
    d = {"q": q, "level": level, "detail": detail, "src": src, "mark": mark}
    if url: d['url'] = url
    return d

DEN_WHO = {
    "levels": [{"id": "city", "label": "Denver", "home": True}, {"id": "state", "label": "The state (Colorado)"}, {"id": "fed", "label": "Washington (federal)"}],
    "decisions": [
        dec("The lowest wage a Denver employer may pay", "city", "Denver sets its own minimum wage, $19.29 an hour in 2026, after Colorado let cities do so in 2019.", "Denver Department of Finance, Aug 2025", "https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Department-of-Finance/News/2025/Denver-Local-Minimum-Wage-Adjusts-to-19.29-per-Hour-for-2026"),
        dec("Whether Denver workers get paid family and medical leave", "state", "Colorado voters approved FAMLI in 2020; it pays up to 12 weeks. A separate 2020 state law gives paid sick leave at employers of every size.", "Denver shared mirror (FAMLI; Healthy Families and Workplaces Act)", "https://famli.colorado.gov/"),
        dec("Who draws Colorado's congressional districts", "state", "An independent 12-member commission, created when voters passed Amendment Y in 2018, took the job from the legislature.", "Colorado Independent Redistricting Commissions", "https://redistricting.colorado.gov/content/congressional-redistricting"),
        dec("Whether Denver police use license-plate cameras", "city", "The city council rejected a Flock contract extension unanimously in May 2025, the mayor extended it with new limits, and in 2026 the council approved 50 Axon cameras, 7 to 6.", "Colorado Politics; Denver7", "https://www.denver7.com/news/local-news/denver-city-council-narrowly-approves-axon-contract-to-replace-flock-cameras"),
        dec("How Coloradans vote, and whether people on parole may vote", "state", "Colorado mails every registered voter a ballot, registers voters automatically, and since 2019 lets people on parole vote.", "Colorado Secretary of State; Colorado Springs Gazette", "https://www.coloradosos.gov/pubs/newsRoom/pressReleases/2020/PR20200519VoterReg.html"),
        dec("Whether a low-wage Denver parent can get Medicaid", "state", "Colorado expanded Medicaid under the Affordable Care Act: adults qualify up to about 133% of the poverty level.", "Denver shared mirror (Health First Colorado, HCPF)", "https://hcpf.colorado.gov/"),
        dec("Whether those Medicaid adults must report work hours from 2027", "fed", "The 2025 federal budget law adds work or community-engagement requirements for expansion adults from January 1, 2027, in every expansion state.", "Denver shared mirror (H.R. 1, 2025)", "https://hcpf.colorado.gov/"),
    ]}

def who(title, question, levels, decisions, notice, yourCall):
    return {"kind": "WhoDecides", "title": title, "question": question, "levels": levels, "decisions": decisions,
            "notice": notice, "yourCall": yourCall, "denver": DEN_WHO}

T['memphis']['interactive']['WHO'] = who(
    "Who decides for Memphis?",
    "Nine decisions that shape a Memphis family's week. Who made each one: the city, the state in Nashville, or Washington?",
    [{"id": "city", "label": "Memphis or Shelby County", "home": True}, {"id": "state", "label": "Nashville (the state)"}, {"id": "fed", "label": "Washington (federal)"}],
    [dec("The lowest wage a Memphis employer may pay", "state", "Tennessee has no state minimum wage, so the federal $7.25 applies, and a 2013 state law bars cities and counties from requiring private employers to pay more.", "Tenn. Code § 50-2-112", "https://law.justia.com/codes/tennessee/2019/title-50/chapter-2/part-1/section-50-2-112/"),
     dec("Whether Memphis workers get paid sick leave", "state", "The same 2013 law bars local governments from requiring leave policies beyond state and federal law.", "HR Daily Advisor, on Tennessee's 2013 law", "https://hrdailyadvisor.com/?p=47382"),
     dec("Who represents Memphis in Congress", "state", "In May 2026 the legislature split the 9th District, the state's only majority-Black district, into three, and the governor signed the map the same day. The NAACP sued in state court.", "AP via Atlanta Journal-Constitution", "https://www.ajc.com/news/2026/05/tennessee-enacts-new-us-house-map-carving-up-majority-black-district-in-memphis/"),
     dec("Who controls the budget and the superintendent of Memphis-Shelby County Schools", "state", "A 2026 state law created a nine-member board appointed by the governor and the two legislative speakers, with final say over the budget, large contracts and the superintendent until 2030. The district and the county commission sued.", "Chalkbeat Tennessee", "https://www.chalkbeat.org/tennessee/2026/05/22/memphis-schools-takeover-becomes-law/"),
     dec("Whether federal agents and the National Guard patrol Memphis streets", "fed", "A presidential memorandum created the Memphis Safe Task Force, which began on September 29, 2025, with the governor's support for the Guard.", "WTVF NewsChannel 5", "https://www.newschannel5.com/news/trump-signs-order-deploying-national-guard-to-memphis-to-combat-crime"),
     dec("Whether the Justice Department's findings on Memphis police still stand", "fed", "The department found a pattern of excessive force and discrimination in December 2024, then closed the case and retracted the findings in May 2025.", "Tennessee Lookout", "https://tennesseelookout.com/2025/05/21/department-of-justice-scraps-memphis-police-investigation/"),
     dec("Whether Memphis would negotiate a federal consent decree on policing in 2024", "city", "The city told the Justice Department it would not enter an agreement in principle; the police chief pointed to changes already made.", "CNN via ABC17", "https://abc17news.com/?p=1403598"),
     dec("When someone with a felony record can vote again", "state", "A 2026 state law dropped the rule that all court costs be paid first and eased the child-support rule; Tennessee still has more than 400,000 people who cannot vote because of a felony.", "Tennessee Lookout", "https://tennesseelookout.com/2026/03/17/lawmakers-ease-financial-hurdles-for-regaining-voting-rights-after-felony-convictions/"),
     dec("Whether a low-wage Memphis parent can get Medicaid", "state", "Tennessee has not expanded Medicaid; TennCare covers a parent only up to 100% of the poverty level.", "TennCare eligibility guide (Memphis packet)", "https://www.tn.gov/tenncare/members-applicants/eligibility-reference-guide.html")],
    "Count where each decision was made. Then run it in Denver, where the city sets its own wage. The frustration is not only what was decided, but how little of it was decided in Memphis.",
    "Pick one decision made in Nashville. Who would have to agree for Memphis to decide it for itself, and what would they say?")

T['dc']['interactive']['WHO'] = who(
    "Who decides for D.C.?",
    "Seven decisions about life in the nation's capital. Who made each one: D.C.'s own government, Congress, or the president?",
    [{"id": "city", "label": "D.C. (mayor and council)", "home": True}, {"id": "cong", "label": "Congress"}, {"id": "pres", "label": "The president"}],
    [dec("Whether a law the D.C. Council passes takes effect", "cong", "Every D.C. act goes to Congress for a review period (30 days, 60 for criminal law), and Congress can block it; it did in 2023 with D.C.'s criminal code rewrite.", "Congressional Research Service", "https://www.everycrsreport.com/reports/IN12122.html"),
     dec("D.C.'s budget", "cong", "The Home Rule Act lets Congress disapprove the city's laws, including its annual budget.", "Congressional Research Service", "https://www.everycrsreport.com/reports/R44099.html"),
     dec("Who controlled D.C.'s police in August 2025", "pres", "The president declared a public-safety emergency and took control of the Metropolitan Police; the city went to court and the administration partly retreated.", "AP via Yahoo News", "https://www.yahoo.com/news/articles/president-trump-ramps-takeover-washingtons-164400281.html"),
     dec("Whether the National Guard patrols D.C.", "pres", "The D.C. Guard is the only Guard unit that reports to the president alone; by August 2026 the deployment had grown to 4,636 troops from 23 states.", "Axios; Boston Globe", "https://www.bostonglobe.com/2026/08/10/nation/trump-washington-takeover-national-guard/"),
     dec("Whether D.C.'s member of Congress can vote on final passage of a bill", "cong", "D.C.'s delegate votes in committee but not on final passage in the full House; whether she may vote on amendments depends on House rules set by the majority.", "Washington Times, 2017; Office of Del. Norton", "https://norton.house.gov/media-center/press-releases/norton-votes-on-house-floor-in-committee-of-the-whole"),
     dec("Paid family leave for D.C. workers", "city", "D.C. Paid Family Leave is a local law: up to 12 weeks for a new baby, 10 for your own illness, at 90% of pay for lower-wage workers.", "D.C. Code § 32-541.04", "https://code.dccouncil.gov/us/dc/council/code/sections/32-541.04"),
     dec("Clearing homeless encampments from federal parkland in D.C.", "pres", "In August 2025 the White House said U.S. Park Police had removed about 70 encampments, offering shelter or treatment.", "AP via Philadelphia Inquirer", "https://www.inquirer.com/news/nation-world/trump-washington-dc-national-guard-troops-20250812.html")],
    "D.C. elects a mayor and council, but most of the big levers sit with people D.C. residents do not elect. Compare Denver, where most of the same decisions are made by people Denver voters elect.",
    "Is there a reason the capital should be governed differently from a state? Give the best case for it and the best case against it.")

T['panama']['interactive']['WHO'] = who(
    "Who decides for the Ngäbe?",
    "Four decisions about land, pensions and mining. Who made each one: the comarca, Panama's national government, or the courts?",
    [{"id": "com", "label": "The comarca", "home": True}, {"id": "nat", "label": "Panama's national government"}, {"id": "court", "label": "The courts"}],
    [dec("Creating the Comarca Ngäbe-Buglé and holding its land in common", "nat", "The comarca was created by national law in 1997, after decades of Ngäbe organizing; its land is held collectively.", "Ley 10 de 1997 (Panama packet)", None, "care"),
     dec("Marking the boundaries of the comarca's annex areas", "nat", "The 1997 law requires it, and it is still not done: in May 2026 Ngäbe leaders told a UN forum that about 150,000 people lack secure land as a result.", "La Estrella de Panamá", "https://www.laestrella.com.pa/panama/nacional/lideres-ngabe-denuncian-ante-la-onu-desalojos-y-abusos-en-bocas-del-toro-EE22519269"),
     dec("The 2025 social security reform (Law 462)", "nat", "The National Assembly passed it in March 2025; protests in the comarca followed, and the government declared a state of emergency in neighboring Bocas del Toro.", "Front Line Defenders", "https://frontlinedefenders.org/tr/node/8917"),
     dec("Whether the Cobre Panamá mine contract stood", "court", "After nationwide protests, the Supreme Court ruled the contract unconstitutional in late November 2023 and the mine stopped producing.", "Panama packet", None, "care")],
    "All four were decided far from the comarca, by a government the Ngäbe vote for but do not control. The one thing the comarca holds itself, its land in common, exists because of a national law it fought for.",
    "If you were writing the rule for when Panama must ask the Ngäbe first, which of these four would it cover, and who would object?")

peru['interactive']['WHO'] = who(
    "Who decides for Quispicanchi?",
    "Seven decisions that shape life in the South Valley. Who made each one: the comunidad, Cusco, or Lima?",
    [{"id": "com", "label": "The comunidad", "home": True}, {"id": "cus", "label": "Cusco (region and towns)"}, {"id": "lima", "label": "Lima (national)"}],
    [dec("Who farms which plot", "com", "Most land is held through the comunidad campesina, not as private titles, and families farm small plots scattered across the mountain.", "Peru packet, Barrier 1"),
     dec("When the irrigation canals are cleaned", "com", "Canals are kept up by faenas, communal work days the community organizes.", "Peru packet, Barrier 2"),
     dec("How the Cusco tourist-ticket money is split", "lima", "National law splits it: 40% to district towns, 30% to the Ministry of Culture, 20% to provinces and 10% to regional tourism.", "Ley 28719 (recheck against Ley 32586, May 2026)", None, "care"),
     dec("Whether towns may spend ticket money on clean water", "lima", "The national rules limit what the money may pay for. The Comptroller found ten Cusco towns, Quispicanchi among them, spent S/104 million on uses not allowed, such as water and sanitation (2018–19).", "Contraloría via Gestión (Peru packet)"),
     dec("School meals in Cusco's schools", "lima", "A national program, Wasi Mikuna, served 204,560 students in 4,105 Cusco schools at the end of 2024.", "MIDIS to Congress, Feb 2025 (Peru packet)"),
     dec("Who became president in 2026", "lima", "A national vote: Keiko Fujimori won the runoff with 50.1%, carried by metropolitan Lima, while the south voted heavily for Roberto Sánchez.", "Rio Times; GeoCurrents", "https://www.riotimesonline.com/?p=708464"),
     dec("Bringing agencies together on femicide and family violence in the region", "cus", "In September 2026 Cusco's regional governor convened the region's agencies to act on femicide and family violence.", "Gobierno Regional Cusco", "https://www.gob.pe/institucion/regioncusco/noticias/1450600-cusco-cierra-filas-contra-la-violencia-gobernador-werner-salcedo-exige-accion-firme-para-proteger-a-mujeres-y-familias-de-la-region")],
    "The comunidad decides a great deal about land and water close to home. The money, the rules for spending it and the national vote are decided in Lima. Both are true at once.",
    "What does the comunidad decide for itself that your own neighborhood does not? What would you hand to it, and what to Lima?")

# ---------- Hours of work ----------
HOURS = {
    "kind": "HoursOfWork", "title": "Hours of work: Tijuana, San Diego, Denver",
    "question": "The same household needs food, rent and bus rides. How many hours of minimum-wage work does that take on each side of the wall, and in Denver?",
    "people": 4, "rides": 44,
    "notice": "Measured in hours, not dollars or pesos, there is no exchange rate to argue about. Tijuana's food basket alone takes more hours than a Denver family's food and many bus rides together. The rent is the open question: no source yet gives a colonia rent, so you set it.",
    "yourCall": "How many full-time earners does the Tijuana household need at your rent? Who in the family would that be, and what would they stop doing?",
    "places": [
        {"id": "tj", "label": "Tijuana", "cur": "MX$", "wage": 440.87 * 7 / 48, "month": 208,
         "wageText": "440.87 pesos a day (2026), about 64 pesos an hour on a 48-hour week (our arithmetic: a daily wage also pays the rest day)",
         "wageSrc": {"src": "CONASAMI via Tijuana packet", "url": "https://www.gob.mx/conasami"},
         "food": {"pp": 2590.61, "text": "INEGI's urban food basket: 2,590.61 pesos per person a month (Sept 2026).", "src": "INEGI, Líneas de pobreza por ingresos", "url": "https://www.inegi.org.mx/temas/lineas/"},
         "rent": {"amt": None, "guess": 5000, "min": 1000, "max": 15000, "step": 250, "label": "Rent in a Tijuana colonia (your estimate)", "note": "No source yet gives a colonia rent. Set your own estimate and say so in your answer.", "text": "Your estimate.", "src": "not yet sourced"},
         "bus": {"fare": 15, "text": "Most routes charged 15 pesos until October 2026; some now charge 18–20 without approval.", "src": "Zeta Tijuana, Nov 2026", "url": "https://zetatijuana.com/2026/11/por-falta-de-acuerdos-con-imos-transportistas-aplican-tarifazo-en-rutas-de-tijuana/"}},
        {"id": "sd", "label": "San Diego", "cur": "$", "wage": 17.75, "month": 173,
         "wageText": "$17.75 an hour in the city of San Diego (2026)",
         "wageSrc": {"src": "City of San Diego", "url": "https://www.sandiego.gov/sites/default/files/2025-12/2025-12-31-city-of-san-diego-hourly-minimum-wage-will-increase-to-17.75-effective-jan-1-2026.pdf"},
         "food": {"pp": 1018.20 / 4, "text": "USDA Thrifty Food Plan: $1,018.20 a month for a family of four (June 2026), about $255 a person (our arithmetic). National, not San Diego prices.", "src": "USDA Thrifty Food Plan via WTOP", "url": "https://wtop.com/news/2026/07/how-much-should-i-spend-on-groceries/"},
         "rent": {"amt": 2270, "text": "Average one-bedroom rent: $2,270 (Nov 2026).", "src": "Rentometer", "url": "https://www.rentometer.com/average-rent-in/ca/san-diego-ca"},
         "bus": {"fare": 3.00, "text": "One-way MTS fare: $3 since October 1, 2026.", "src": "San Diego MTS", "url": "https://www.sdmts.com/sites/default/files/attachments/september-service-change-2026-web.pdf"}},
        {"id": "den", "label": "Denver", "cur": "$", "wage": 19.29, "month": 173,
         "wageText": "$19.29 an hour in Denver (2026)",
         "wageSrc": {"src": "Denver Department of Finance", "url": "https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Department-of-Finance/News/2025/Denver-Local-Minimum-Wage-Adjusts-to-19.29-per-Hour-for-2026"},
         "food": {"pp": 1018.20 / 4, "text": "USDA Thrifty Food Plan: $1,018.20 a month for a family of four (June 2026), about $255 a person (our arithmetic). National, not Denver prices.", "src": "USDA Thrifty Food Plan via WTOP", "url": "https://wtop.com/news/2026/07/how-much-should-i-spend-on-groceries/"},
         "rent": {"amt": 1874, "text": "Denver metro median rent: $1,874 a month, all units (ACS 2020–2024).", "src": "USAFacts (Denver mirror D-HOUSING)"},
         "bus": {"fare": 2.75, "text": "RTD standard fare: $2.75 for a three-hour pass.", "src": "RTD", "url": "https://www.rtd-denver.com/fares"}}]}
for tid in ('tijuana-toe', 'tijuana-doc'):
    T[tid]['interactive']['HOURS'] = copy.deepcopy(HOURS)

REPS = {'dc': [['Fr\\. McKenna\'s line, inscribed at McKenna Hall: [\\u201c"]The greatest undeveloped resource of our nation and our world is the poor\\.?[\\u201d"]', "A line of Fr. McKenna's, inscribed at McKenna Hall, calls the poor the greatest undeveloped resource of the nation and the world."]], 'denver': [[r", was one of the three original Denver-area treatment centers in the \*Colorado Sun\*'s hotline analysis alongside Tennyson and Cleo Wallace\.", "."],
            [r", hotline data with 9News \(Jun 2026\)", ""], [r"^\*\*Barrier 8\*\* involves a criminal case.*$", ""],
            [r", hotline$", ""], [r"^\*Colorado Sun\* / 9News, hotline calls.*$", ""], ['Do not write [\\u201c"]children are taken for being poor\\.?[\\u201d"]', 'It is not accurate to say children are taken for being poor.']], 'dr': [[r"^\*\*Edwidge Danticat\*\*.*$", ""], [r", the context box\)", ")"], ['someone says, [\\u201c"]Why not just send the money instead of going\\?[\\u201d"]', 'someone asks why not just send the money instead of going.']], 'honduras-teg': [['^.*class visit from two IS staff.*$', '']], 'jfarm': [['[\\u201c"]built on the four cornerstones of Prayer, Community, Service and Simplicity\\.?[\\u201d"]', 'built on four cornerstones: prayer, community, service and simplicity.'], ['comes [\\u201c"]directly from the community, not from us\\.?[\\u201d"]', 'comes from the community itself, not from Jerusalem Farm.'], ['with [\\u201c"]financial, educational, or emotional barriers[\\u201d"]', 'with financial, educational or emotional barriers'], ['\\([\\u201c"]the money has already been spent[\\u201d"]\\)', '(the city said the money had already been spent)'], ['[\\u201c"]Among the highest legal caps in the country[\\u201d"] was not checked', 'Whether it is among the highest legal caps in the country was not checked'], ['until students heard whom it was for', 'until someone said whom it was for']], 'kentucky': [['Prestonsburg\'s mayor after the 2025 flood: [\\u201c"]Everybody is lending a helping hand\\.?[\\u201d"]', "After the 2025 flood, Prestonsburg's mayor said everyone was pitching in."], ['ownership [\\u201c"]highly concentrated among a few absentee and corporate owners\\.?[\\u201d"]', 'ownership highly concentrated among a few absentee and corporate owners.'], ['Teach it only as [\\u201c"]how much medicine moves through a county,?[\\u201d"]', 'Teach it only as how much medicine moves through a county,']], 'memphis': [['— [\\u201c"]the largest and shortest public school district merger in U\\.S\\. history[\\u201d"] in the Daily Memphian\'s words —', '— which the Daily Memphian called the largest, and shortest-lived, public school district merger in U.S. history —'], ['bridging [\\u201c"]the gap between visitors and locals,?[\\u201d"]', 'bridging the gap between visitors and locals,']], 'quito': [['Halligan said the same in 2009: [\\u201c"]Ours is not a charity program\\.?[\\u201d"] \\(NCR\\)\\.', 'Halligan said the same in 2009: the Center is not a charity program (NCR).'], ['a public answer to [\\u201c"]where do children go after school\\.?[\\u201d"]', 'a public answer to the question of where children go after school.'], ['Say [\\u201c"]no household cuts as of Oct 2026,?[\\u201d"]', 'Say there were no household cuts as of Oct 2026,'], ['[\\u201c"]universales y gratuitos en todos los niveles de atención[\\u201d"],?', 'universal and free at every level of care,']], 'tijuana-doc': [['into the [\\u201c"]up to one or two minimum wages[\\u201d"] bands', 'into the bands of up to one or two minimum wages'], ['The founder describes the trips as [\\u201c"]rather than this just being an exercise in voyeurism\\.?[\\u201d"]', 'The founder says she wants the trips to be more than an exercise in voyeurism.']], 'tijuana-toe': [['\\([\\u201c"]Guaranteeing the States Protection Against Invasion[\\u201d"]\\)', '(*Guaranteeing the States Protection Against Invasion*)'], ['Her words: [\\u201c"]I hope there won\'t be a fence too long here\\.?[\\u201d"]', 'She said she hoped the fence would not stand long.']]}
for tid, r in REPS.items():
    T[tid].setdefault('replace', []).extend(r)
for tid, st in {'memphis': {'bank': True}, 'dc': {'bank': True}, 'kentucky': {'bank': True}, 'jfarm': {'bank': True}}.items():
    T[tid]['interactive']['E']['start'] = st
for tid, cfg in T.items():
    cfg = dict(cfg); cfg.setdefault('status', 'public'); cfg.setdefault('asOf', '2026-11-19')
    order = ['name', 'short', 'status', 'asOf', 'region', 'ft', 'lat', 'lon', 'lang', 'partner', 'currency']
    out = {k: cfg[k] for k in order if k in cfg}; out.update({k: v for k, v in cfg.items() if k not in out})
    json.dump(out, open(os.path.join(ROOT, 'labs', tid + '.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(peru, open(os.path.join(ROOT, 'labs', 'peru.json'), 'w'), ensure_ascii=False, indent=1)
print('wrote', len(T) + 1)
