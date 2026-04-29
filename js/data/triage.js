// ═══════════════════════════════════════════════════════
// TRIAGE COMPANION — Data layer
// Patterns, reply templates, special-handling, aliases.
// Mirrors ~/PARA/CVC_Job/scripts/triage_companion.py so the
// local Python tool and this static section stay in sync.
// ═══════════════════════════════════════════════════════

// ── Workflow stages (BatchApplication state machine) ──
var triageWORKFLOW_STAGES = [
  'Created',
  'Consent Given',
  'AER Form Submitted',
  'Eligible and Approved',
  'Enrolled',
  'Prerequisite Pending Review',
  'Registered & Pending Validation',
  'Validated & Registered'
];
var triageTERMINAL_FAILURES = ['Application Denied', 'Ineligible', 'Drop Pending', 'Dropped'];

// ── Pattern library ──
// Matches v7.2 Pattern Quick-Match (A1-A8, B1-B6, C1-C5, D1-D2, E1, plus
// new OWEN family + 1098-T + REFUND off-ramps).
var triagePATTERNS = [
  { letter: 'A1', name: 'Non-CCC student',
    signals: ['not a ccc', 'no cccid', "haven't applied", 'non-ccc', 'different state college'],
    pice_query: '',
    summary: "Student isn't enrolled at any California Community College. Redirect to CCCApply at icangotocollege.com." },
  { letter: 'A2', name: 'CCC student, HC not yet in Exchange',
    signals: ['butte', 'not yet integrated', 'santa monica', 'sierra'],
    pice_query: '',
    summary: "Student's HC isn't a live Exchange Home College yet. Redirect to apply directly at TC via CCCApply." },
  { letter: 'A4', name: 'Post-HS / pre-18 (special admit)',
    signals: ['high school', 'still in high school', 'under 18', 'dual enrollment', 'concurrent enrollment', 'special admit'],
    pice_query: '',
    summary: 'HS student. Cite eligibility page; route to TC direct admission as special-admit.' },
  { letter: 'A7', name: 'Not yet matriculated at HC (first-term gate)',
    signals: ['canvas account not found', "i'm a new student", 'just applied', "haven't started", 'first time', 'canvas account may not have been created', "couldn't find a canvas"],
    pice_query: '',
    summary: 'New applicant — has CCCID + listed HC, but hasn\'t completed/isn\'t currently in any HC class. WORKING AS DESIGNED. Quote eligibility page verbatim. Route them to register at HC first.' },
  { letter: 'A8', name: 'Pre-contactInfo CCCID never linked to CIS (Napa pattern)',
    signals: ['no record found', 'cccid not on record', 'contactinfo returned empty', 'paper application', 'pre-january', 'before january'],
    pice_query: '',
    summary: 'CCCID generated on paper before contactInfo went live in Jan 2026. Lateral handoff to TC\'s A&R to attach CCCID to existing CIS record. Use Logan\'s account-export login-frequency trick to find the active A&R contact.' },
  { letter: 'B1', name: 'CCCID mismatch / SAML',
    signals: ['eppn', 'saml', 'no cccid passed', 'auth attribute', 'edupersonaffiliation'],
    pice_query: '',
    summary: 'HC SAML config not passing CCCID + eduPersonAffiliation=student. Escalate OUT to N2N with HC\'s SAML config; meanwhile redirect to TC direct.' },
  { letter: 'B6', name: 'Wrong HC selected at signup',
    signals: ['wrong home college', 'selected wrong', 'picked the wrong'],
    pice_query: '',
    summary: 'Student picked the wrong HC. Per Rule 5: drop and re-cross-enroll with correct HC. Manual HC change is NOT supported.' },
  { letter: 'C1', name: 'Prereq pending review',
    signals: ['prerequisite pending', 'prereq pending', 'prerequisite review'],
    pice_query: 'Prerequisite Pending Review',
    summary: 'Walk through Exchange prereq flow; transcript is strongest evidence. For 8 specific TCs, the cvc.edu/cvc-exchange-prerequisite-clearance/ page may also apply — confirm with Donna.' },
  { letter: 'C3', name: 'Drop / delete code (Banner Drop Delete Code display)',
    signals: ['status update failed', 'drop delete code', 'drop failed but seems dropped'],
    pice_query: 'Status Update Failed',
    summary: 'Banner SIS display quirk — drop actually went through. Confirm with TC A&R; reply: "this is a display-only issue." Layer 5 state, not a real failure.' },
  { letter: 'D1', name: 'Canvas course not appearing',
    signals: ['canvas course missing', 'not showing in canvas', "can't see my class in canvas"],
    pice_query: 'Canvas',
    summary: 'Likely timing (Canvas Trust hasn\'t run yet) or Canvas provisioning lag. Wait 24-48h; if persists, check Canvas API for account at TC.' },
  { letter: 'D2', name: 'Canvas email mismatch (default-email)',
    signals: ['default email', 'email mismatch', 'canvas profile email'],
    pice_query: 'Canvas account not found',
    summary: 'WARNING: default-email advice was Donna-corrected on the CCSF case 2026-04-27. Verify with Donna before sending. Logan\'s suggested next step: search Canvas API for account by CCCID + name first.' },
  { letter: 'E1', name: 'Payment failure / paid-but-not-enrolled',
    signals: ['paid but not enrolled', 'card was charged', 'touchnet', 'confirm payment', "didn't click confirm"],
    pice_query: 'payment',
    summary: 'Most common cause: student didn\'t click Confirm Payment after bank redirect. Affects 23 colleges. Ask: did they see and click Confirm? Layer 5 reconciliation.' },
  { letter: 'OWEN', name: 'Stuck Enrolled — TC rejected registration (PICE-795 family)',
    signals: ['enrolled', 'registered & pending validation', 'validated never reached', 'section closed', 'closed to waitlist'],
    pice_query: 'registerStudents',
    summary: 'BANNER-DIRECT pattern. Admin Panel shows Status: Enrolled but timeline never reaches Validated & Registered. PICE-795 root cause: TC\'s Banner returned "Closed" (section full) but Parchment couldn\'t parse the response. Reply in student vocabulary: "the section was full — register for an alternate".' },
  { letter: 'CCPG', name: 'CCPG fee waiver at TC',
    signals: ['ccpg', 'fee waiver', 'california college promise', 'fa application', 'waiver at teaching'],
    pice_query: '',
    summary: 'TC sits in a non-Title-IV shell program — Pell can\'t disburse there. CCPG is per-college; student typically files a separate CCPG at the TC. Confirm exact mechanism with Donna (open question 2026-04-28).' },
  { letter: 'HOLD', name: 'Hold at HC blocking registration',
    signals: ['hold on my account', 'registration hold', 'cleared the hold', 'account hold'],
    pice_query: '',
    summary: 'Student has a hold at HC blocking cross-enrollment. Resolution: contact HC A&R to identify and clear the hold. CVC can\'t override.' },
  { letter: 'EPPN', name: 'EPPN / SAML attribute missing at sign-in',
    signals: ['login system did not provide an eppn', 'eppn missing', 'edupersonaffiliation missing'],
    pice_query: '',
    summary: 'HC IDP didn\'t pass eduPersonAffiliation attribute. Configuration issue at HC IT. Redirect student to HC IT; offer TC-direct via CCCApply as parallel path.' },
  { letter: 'A-Eligible', name: 'Returning adult / non-traditional',
    signals: ['returning adult', 'non-traditional', 'no high school diploma', 'adult learner', 'ged'],
    pice_query: '',
    summary: 'Adult learners and returning students are eligible — no HS diploma required. On self-certification, select "None of the above."' },
  { letter: 'TUITION', name: 'Out-of-state tuition for CA resident',
    signals: ['out-of-state tuition', 'out of state tuition', 'non-resident tuition', '$1864', 'too high tuition'],
    pice_query: 'residency',
    summary: 'Residency-not-synced pattern (Layer 5). Each college keeps its own residency record. Resolution: lateral to TC A&R with HC residency proof. Don\'t pay until rate is correct.' },
  { letter: '1098-T', name: 'Tax form question',
    signals: ['1098-t', '1098t', 'tax form', 'tax document'],
    pice_query: '',
    summary: 'NOT a CVC ticket. Redirect student to home college financial services.' },
  { letter: 'REFUND', name: 'Refund request',
    signals: ['refund', 'money back', 'tuition refund'],
    pice_query: '',
    summary: 'NOT a CVC ticket. TC cashier office processes refunds. Redirect.' },
  { letter: 'SUMMER', name: 'When is X term available',
    signals: ['when is summer', 'when is fall', 'when does summer open', 'course not showing yet'],
    pice_query: '',
    summary: 'Each TC sets its own enrollment calendar. Sections appear once TC has loaded their schedule into their SIS and CVC\'s nightly catalog import has picked it up. Bookmark Course Finder, check back as TC opens.' }
];

// ── Reply templates (slot-filled at render time) ──
var triageREPLY_TEMPLATES = {
  'A1':
    "Hi {NAME},\n\nThanks for reaching out. To take a class through the CVC Exchange, you first need to apply to a California community college through CCCApply at icangotocollege.com. Once you have a CCCID and you're enrolled at a Home College, you can come back here to cross-enroll.\n\nThank you,\nHenry",
  'A2':
    "Hi {NAME},\n\n{HC} isn't yet integrated as a Home College on the CVC Exchange — students at {HC} can't currently cross-enroll through us. Your fastest path is to apply directly to {TC} through CCCApply at icangotocollege.com. They'll process your enrollment as a regular admit and you can take the course that way.\n\nThank you,\nHenry",
  'A4':
    "Hi {NAME},\n\nIf you're still in high school and want to take a college class, you'd apply directly to that college as a special-admit or dual-enrollment student. Each college has its own form. CVC doesn't handle this enrollment type — your high school counselor can help you with the paperwork.\n\nThank you,\nHenry",
  'A7':
    "Hi {NAME},\n\nThanks for reaching out — and your intuition that this is tied to being a new student is right. The error is the system working correctly for new applicants.\n\nPer CVC's eligibility (cvc.edu/students/student-eligibility/): \"If this is your first term or you were recently admitted at your Home College, you must have completed a class or be taking a class that is currently in progress in order to use the Exchange.\" The \"Canvas account not found\" message is one of the system signals that this gate hasn't been met yet — your {HC} Canvas account is created once you register for your first {HC} class.\n\nPath forward:\n\n1. Register for a {HC} class for the current term through {HC}'s normal student portal.\n2. Once your {HC} registration is active, the CVC cross-enrollment for {COURSE} should work — provided the standard requirements are also met.\n\nThank you,\nHenry",
  'A8':
    "Hi {NAME},\n\nThanks for the details. I pulled your record — your CCCID is valid, but it's not linked to your existing student record at {HC} yet. This usually happens when someone applied on paper before our system started auto-linking accounts in January, so the connection step never ran for you.\n\nWhat to do: please reach out to {HC} Admissions & Records and ask them to \"attach my CCCID to my student record.\" Once that's done, the cross-enrollment for {COURSE} should process within a couple of business days. I'll keep this ticket open and follow up once you confirm the attach is done.\n\nThank you,\nHenry",
  'OWEN':
    "Hi {NAME},\n\nThanks for the screenshots — that helped me confirm what happened.\n\nThe {COURSE} section you registered for was already closed (full) when the system tried to confirm your seat at {TC}. The dashboard didn't reflect that clearly, which is why it looked like you were enrolled. Sorry for the confusion.\n\nWhat to do: open CVC Course Finder, find another {COURSE} section for the same term — at {TC} or another college — and register for that one. CVC doesn't have a waitlist, so an open section is the path forward.\n\nThank you,\nHenry",
  'C3':
    "Hi {NAME},\n\nI looked into your record. The \"Status Update Failed\" message you saw is a known display issue on {TC}'s side — your drop actually went through, despite what the dashboard says. I've confirmed with {TC} that you're not registered for {COURSE} anymore.\n\nNothing else for you to do. The dashboard usually catches up within a day or two.\n\nThank you,\nHenry",
  'E1':
    "Hi {NAME},\n\nThis usually happens because the \"Confirm\" button on the payment return page didn't get clicked — the payment processed on the bank's side but our system didn't receive confirmation. Could you check whether you saw and clicked a Confirm button after entering your card info? If you closed the window first, that would explain what you're seeing. We can resolve this; just let me know what you remember.\n\nThank you,\nHenry",
  'CCPG':
    "Hi {NAME},\n\nFor a CVC cross-enrollment, your CCPG (California College Promise Grant) needs to be on file at the Teaching College — {TC} — directly, not just at your Home College. Your home college's CCPG won't carry over automatically. The fastest path: contact {TC}'s Financial Aid office and either file a CCPG application with them, or confirm yours is already on file. Until that lands, you may see a non-resident tuition amount on your dashboard — don't pay yet, give the TC a couple of business days to update.\n\nThank you,\nHenry",
  'HOLD':
    "Hi {NAME},\n\nThe system is showing a registration hold on your account at {HC}. We can't process the cross-enrollment until that's cleared on their side. Please contact {HC} Admissions & Records to identify and clear the hold — once it's resolved, the enrollment should process.\n\nThank you,\nHenry",
  'EPPN':
    "Hi {NAME},\n\nThe error you saw means your Home College's sign-in didn't pass the required identity attribute (ePPN) to the Exchange. This is a configuration issue on {HC} IT's side, not something we can fix from ours. Please contact {HC} IT and let them know the Exchange portal didn't receive an eduPersonAffiliation attribute during sign-in. Once they update the SAML configuration, sign-in should work.\n\nIf you need to register quickly while {HC} sorts that out, you can also apply directly to {TC} through CCCApply at icangotocollege.com.\n\nThank you,\nHenry",
  'A-Eligible':
    "Hi {NAME},\n\nThanks for asking before signing up. The Exchange does not require a high school diploma — adult learners and returning students are eligible. When you sign up, on the self-certification step, select \"None of the above\" since you're not currently in high school. From there the standard enrollment flow applies.\n\nIf you hit a specific error during signup, send me the exact message and I'll help from there.\n\nThank you,\nHenry",
  'TUITION':
    "Hi {NAME},\n\nThanks for flagging this. The non-resident tuition amount is showing because {TC}'s system has an outdated residency record for you. Each college keeps its own residency record — {HC}'s classification doesn't auto-sync to {TC}.\n\nDon't pay at the non-resident rate. Instead, email {TC}'s Admissions & Records office with proof of CA residency from {HC} (a screenshot of your {HC} portal showing CA Resident, or an A&R letter). They'll update their record and the rate will recalculate.\n\nThank you,\nHenry",
  '1098-T':
    "Hi {NAME},\n\nThanks for reaching out. 1098-T tax forms are issued by your home college's financial services office, not by CVC — we don't have visibility into tax-document issuance. Please reach out to {HC} financial services directly. They'll be able to confirm timing and answer questions about the form itself.\n\nThank you,\nHenry",
  'REFUND':
    "Hi {NAME},\n\nRefunds are processed by the {TC} cashier office, not by CVC — we don't have refund authority on our side. Please contact {TC}'s cashier or student accounts office directly with your enrollment details and they'll process the refund through their normal channel.\n\nThank you,\nHenry",
  'SUMMER':
    "Hi {NAME},\n\nCourse availability on the Exchange follows each Teaching College's enrollment calendar — sections appear once the TC has loaded their schedule into their system and our nightly catalog import has picked it up. There isn't a single date for \"all colleges\" because each college's open-registration date varies. Best path: bookmark the Course Finder for the colleges you're interested in and check back as their open-enrollment dates approach.\n\nThank you,\nHenry"
};

// ── Special handling per district (substantive Confluence pages + others) ──
var triageSPECIAL_HANDLING = {
  'Coast Community College District': [
    'Drop Failed cluster — Layer 4 holds pattern. Davin/Destiny canonical cases live here.',
    'Search PICE for existing Coast tickets before drafting.'
  ],
  'Foothill-De Anza Community College District': [
    'Banner Cloud (not Banner Direct) — fewer integration quirks than Mt. SAC family.',
    'Business owner: Claire Chang.',
    "Henry's home district — internal politics may apply if escalating."
  ],
  'Chaffey Community College District': [
    'Ethos APIs. Watch for 412 schema-validation errors (Davin pattern).'
  ],
  'Mt. San Antonio Community College District': [
    'Banner Direct. Stuck-Enrolled + waitlist-closed pattern lives here (PICE-795).',
    "registerStudents API returns Closed/waitlist response that Parchment can't parse.",
    'When Status = Enrolled but Validated & Registered missing → check PICE-795 family before forming hypothesis.'
  ],
  'San Luis Obispo County Community College District': [
    "Cuesta College. Ethos APIs. Donna's 1:1 noted standard cross-enroll patterns."
  ],
  'Rio Hondo Community College District': [
    'Banner Direct. Watch for similar stuck-Enrolled patterns to Mt. SAC.'
  ],
  'Yuba Community College District': [
    'Colleague + Ethos. Post-2.9-upgrade behaviors may differ.'
  ],
  'South Orange County Community College District': [
    'Saddleback places holds on every student → drops fail by default. Workaround: contact Saddleback A&R to process the drop manually (per Logan, 2026-04-28).'
  ],
  'Yosemite Community College District': [
    'BEAM term codes were not in the discovery scan — verify before relying on them.'
  ],
  'Sonoma County Junior College District': [
    'Santa Rosa JC. Homegrown SIS — not BEAM. Different behavior than the rest.'
  ],
  'MiraCosta Community College District': [
    'Prereq-Blocked per Implementation Tracker — student attempts to register may stall at prereq workflow.'
  ],
  'Compton Community College District': [
    'Prereq-Blocked per Implementation Tracker.'
  ],
  'Butte-Glenn Community College District': [
    'NOT YET INTEGRATED as a Home College. Students at Butte cannot use CVC. Redirect to TC direct via CCCApply.'
  ],
  'Santa Monica Community College District': [
    'Homegrown integration (not standard middleware). Currently in Phase 1 implementation per Logan, 2026-04-28.'
  ]
};

// ── PICE TC-name aliases (avoid "san" matching San Bernardino vs Mt. San Antonio) ──
var triageCOLLEGE_ALIASES = {
  'Mt. San Antonio College': ['mt sac', 'mtsac', 'mt. sac', 'mt san antonio', 'mountsac'],
  'Mt. San Jacinto College': ['mt sjc', 'msjc', 'mt san jacinto', 'mt. san jacinto'],
  'City College of San Francisco': ['ccsf', 'city college of san francisco', 'city college sf'],
  'De Anza College': ['de anza', 'deanza'],
  'Foothill College': ['foothill'],
  'Imperial Valley College': ['imperial valley', 'ivc'],
  'Bakersfield College': ['bakersfield'],
  'Cerro Coso Community College': ['cerro coso'],
  'Glendale Community College': ['glendale'],
  'Napa Valley College': ['napa valley', 'napa'],
  'Pasadena City College': ['pasadena', 'pcc'],
  'Santa Rosa Junior College': ['santa rosa', 'srjc'],
  'Saddleback College': ['saddleback'],
  'Mission College': ['mission college'],
  'Cuesta College': ['cuesta'],
  'Rio Hondo College': ['rio hondo'],
  'Coastline Community College': ['coastline'],
  'Golden West College': ['golden west'],
  'Orange Coast College': ['orange coast'],
  'Chaffey College': ['chaffey'],
  'Compton College': ['compton'],
  'Modesto Junior College': ['modesto'],
  'Riverside City College': ['riverside city'],
  'Norco College': ['norco'],
  'Santiago Canyon College': ['santiago canyon'],
  'Santa Ana College': ['santa ana'],
  'Pierce College': ['pierce college', 'la pierce'],
  'Long Beach City College': ['long beach'],
  'Santa Monica College': ['santa monica'],
  'College of the Canyons': ['college of the canyons', 'santa clarita']
};

// ── BEAM env + term codes per district ──
// Mirrors ~/PARA/CVC_Job/beam_term_codes.txt (live BEAM/Postman env discovery
// 2026-04-28). Keyed by district name (matching collegeDB.district). For
// districts in the discovery scan but with '-' codes (Long Beach, MiraCosta,
// SJD, Cerritos, Yosemite, Sonoma): noTermCodes:true and codes are empty.
var triageBEAM_BY_DISTRICT = {
  'Antelope Valley Community College District': { env: 'b-avc-prod', company: 'AKC', sp26: '202630', su26: '202650', fa27: '202770' },
  'Coast Community College District': { env: 'b-coast-prod', company: 'YW1', sp26: '202630', su26: '202650', fa27: '202770' },
  'Foothill-De Anza Community College District': { env: 'b-fhda-prod', company: 'FHDA', sp26: '202503', su26: '202601', fa27: '202702' },
  'Imperial Valley Community College District': { env: 'b-ivc-prod', company: 'IVC', sp26: '202630', su26: '202650', fa27: '202770' },
  'Mt. San Antonio Community College District': { env: 'b-mtsac-prod', company: '11H', sp26: '202540', su26: '202610', fa27: '202820' },
  'Rio Hondo Community College District': { env: 'b-riohondo-prod', company: '84Q', sp26: '202630', su26: '202650', fa27: '202770' },
  'Contra Costa Community College District': { env: 'e-4cd-prod', company: 'NU4', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Allan Hancock Joint Community College District': { env: 'e-allanhancock-prod', company: '631', sp26: '202640', su26: '202710', fa27: '202820' },
  'Barstow Community College District': { env: 'e-barstow-prod', company: 'QYY', sp26: '202603', su26: '202605', fa27: '202707' },
  'Cabrillo Community College District': { env: 'e-cabrillo-prod', company: '0CS', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Santa Clarita Community College District': { env: 'e-canyons-prod', company: 'W8X', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'San Francisco Community College District': { env: 'e-ccsf-prod', company: 'USI', sp26: '202630', su26: '202650', fa27: '202770' },
  'Chaffey Community College District': { env: 'e-chaffey-prod', company: '401', sp26: '2026/SP', su26: '2026/SU', fa27: '2027/FA' },
  'Desert Community College District': { env: 'e-codesert-prod', company: 'ORH', sp26: '26/SP', su26: '26/SU', fa27: '27/FA' },
  'Compton Community College District': { env: 'e-compton-prod', company: 'VTC', sp26: '202630', su26: '202650', fa27: '202770' },
  'San Luis Obispo County Community College District': { env: 'e-cuesta-prod', company: '4KU', sp26: '202603', su26: '202605', fa27: '202707' },
  'El Camino Community College District': { env: 'e-elcamino-prod', company: 'R4H', sp26: '2026/SP', su26: '2026/SU', fa27: '2027/FA' },
  'Feather River Community College District': { env: 'e-featherriver-prod', company: '35T', sp26: '202630', su26: '202650', fa27: '202770' },
  'Gavilan Joint Community College District': { env: 'e-gavilan-prod', company: 'YIO', sp26: '202630', su26: '202650', fa27: '202770' },
  'Grossmont-Cuyamaca Community College District': { env: 'e-gc-grossmont-prod', company: 'NPG', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Hartnell Community College District': { env: 'e-hartnel-prod', company: 'E0B', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Kern Community College District': { env: 'e-kern-prod-ethos', company: '5MX', sp26: '202630', su26: '202650', fa27: '202770' },
  'Lake Tahoe Community College District': { env: 'e-laketahoe-prod', company: 'LTCC', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Marin Community College District': { env: 'e-marin-prod', company: 'IIL', sp26: '202610', su26: '202660', fa27: '202780' },
  'Mendocino-Lake Community College District': { env: 'e-mendocino-prod', company: 'T01', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Merced Community College District': { env: 'e-merced-prod', company: 'D40', sp26: '2026S', su26: '2026U', fa27: '2027F' },
  'North Orange County Community College District': { env: 'e-noccd-prod', company: 'JI4', sp26: '202520', su26: '202530', fa27: '202710' },
  'Ohlone Community College District': { env: 'e-ohlone-prod', company: 'AJ8', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Palo Verde Community College District': { env: 'e-paloverde-prod', company: 'YQQ', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Pasadena Area Community College District': { env: 'e-pasadena-prod', company: 'QDZ', sp26: '202630', su26: '202650', fa27: '202770' },
  'Rancho Santiago Community College District': { env: 'e-ranchosantiago-prod', company: '5DD', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Redwoods Community College District': { env: 'e-redwoods-prod', company: 'VI6', sp26: '2026S', su26: '2026U', fa27: '2027F' },
  'Riverside Community College District': { env: 'e-riverside-prod', company: '?', sp26: '26SP', su26: '26SUM', fa27: '27FAL' },
  'Santa Barbara Community College District': { env: 'e-santabarbara-prod', company: '7CM', sp26: '202650', su26: '202710', fa27: '202830' },
  'Shasta-Tehama-Trinity Joint Community College District': { env: 'e-shasta-prod', company: 'KVE', sp26: '2026S', su26: '2026U', fa27: '2027F' },
  'Siskiyou Joint Community College District': { env: 'e-sisk-prod', company: 'XR4', sp26: '202630', su26: '202650', fa27: '202770' },
  'San Jose-Evergreen Community College District': { env: 'e-sje-prod', company: 'R90', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Southwestern Community College District': { env: 'e-southwestern-prod', company: '7AZ', sp26: '26/SP', su26: '26/SU', fa27: '27/FA' },
  'State Center Community College District': { env: 'e-statecenter-prod', company: 'TR0', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Ventura County Community College District': { env: 'e-ventura-prod', company: '5SL', sp26: '202603', su26: '202605', fa27: '202707' },
  'Victor Valley Community College District': { env: 'e-victorvalley-prod', company: 'ZAC', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'West Hills Community College District': { env: 'e-westhills-prod', company: 'DZJ', sp26: '2026/SP', su26: '2026/SU', fa27: '2027/FA' },
  'West Kern Community College District': { env: 'e-westkerntaft-prod', company: 'ZXN', sp26: '202620', su26: '202630', fa27: '202750' },
  'West Valley-Mission Community College District': { env: 'e-westvalley-prod', company: '8Q3', sp26: '202630', su26: '202650', fa27: '202770' },
  'Yosemite Community College District': { env: 'e-yosemite-prod', company: 'MDN', noTermCodes: true },
  'Yuba Community College District': { env: 'e-yuba-prod', company: 'EXN', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Chabot-Las Positas Community College District': { env: 'eb-chabot-prod', company: 'Y41', sp26: '202505', su26: '202601', fa27: '202702' },
  'Citrus Community College District': { env: 'eb-citrus-prod', company: 'NKB', sp26: '202630', su26: '202640', fa27: '202820' },
  'Monterey Peninsula Community College District': { env: 'eb-montereypen-prod', company: 'TI4', sp26: '202630', su26: '202650', fa27: '202770' },
  'Sequoias Community College District': { env: 'eb-sequoias-prod', company: 'L6U', sp26: '202620', su26: '202630', fa27: '202810' },
  'Solano Community College District': { env: 'eb-solano-prod', company: 'DWS', sp26: '202610', su26: '202660', fa27: '202780' },
  'South Orange County Community College District': { env: 'eb-southorange-prod', company: 'NRV', sp26: '202630', su26: '202650', fa27: '202770' },
  'Copper Mountain Community College District': { env: 'ec-coppermt-prod', company: 'IDF', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Lassen Community College District': { env: 'ec-lassen-prod', company: 'I6O', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Mt. San Jacinto Community College District': { env: 'ec-msj-prod', company: 'WDJ', sp26: '2263', su26: '2265', fa27: '2277' },
  'Napa Valley Community College District': { env: 'ec-napavalley-prod', company: 'WF1', sp26: '26/SP', su26: '26/SU', fa27: '27/FA' },
  'San Bernardino Community College District': { env: 'ec-sanbern-prod', company: '33H', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Sonoma County Junior College District': { env: 'hg-sonomasantarosa-prod', company: 'T7H', noTermCodes: true },
  'Cerritos Community College District': { env: 'p-cerritos-prod', company: 'T1D', noTermCodes: true },
  'Glendale Community College District': { env: 'p-glendale-prod', company: '82P', sp26: '2263', su26: '2265', fa27: '2277' },
  'Los Angeles Community College District': { env: 'p-laccd-prod', company: '82A', sp26: '2264', su26: '2266', fa27: '2278' },
  'Long Beach Community College District': { env: 'p-lbccd-prod', company: 'BVW', noTermCodes: true },
  'Los Rios Community College District': { env: 'p-losrios-prod2', company: '8NE', sp26: '1263', su26: '1266', fa27: '1279' },
  'MiraCosta Community College District': { env: 'p-mcccd-prod', company: '53I', noTermCodes: true },
  'Palomar Community College District': { env: 'p-palomar-prod', company: 'HSA', sp26: '2026SP', su26: '2026SU', fa27: '2027FA' },
  'Peralta Community College District': { env: 'p-peralta-prod', company: 'QQD', sp26: '1262', su26: '1263', fa27: '1274' },
  'San Diego Community College District': { env: 'p-sandiego-prod', company: '9Y0', sp26: '2263', su26: '2265', fa27: '2277' },
  'San Joaquin Delta Community College District': { env: 'p-sanjoaq-sjd-prod', company: 'CL0', noTermCodes: true }
};

// ── Pre-send checklist (5 questions every reply gets read against) ──
var triagePRESEND_CHECKLIST = [
  'Did Step 0d (PICE/BLN lookup) actually run?',
  "Is 'Enrolled' being treated as terminal? (It's stage 5 of 8 — only 'Validated & Registered' is terminal.)",
  'Vendor or architecture words in the body? (N2N, Parchment, middleware, vendor, PICE, Banner, Colleague, SIS, API, integration — strip every one.)',
  'Is there exactly one concrete next step? (Not three. One.)',
  'If A7, is the eligibility page quoted verbatim from cvc.edu/students/student-eligibility/?'
];
