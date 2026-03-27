// ═══ BARRIER DATA ═══
var barriers=[
{n:1,ticketPct:18,title:'No-Show Students Require Manual Drops',cat:'WORKFLOW',sev:'high',impact:'Teaching Colleges must manually ask A&R to drop CVC students who never attend. No automated drop path. Occupied seats block local waitlisted students.',who:'Teaching College A&R staff, local students on waitlists',approach:'Track ticket volume by college and term. Document manual workaround clearly. Surface pattern data for product automation prioritization.'},
{n:2,ticketPct:16,title:"Prerequisites Can't Be Verified Across Colleges",cat:'INTEROP',sev:'high',impact:'Courses with prerequisites excluded from Exchange. Students must upload transcripts for manual review. Many don\'t attempt it.',who:'Students needing upper-level courses, Teaching College staff',approach:'Document prerequisite clearance process. Track abandonment at this step. Flag as barrier to course access.'},
{n:3,ticketPct:7,title:"DSPS Accommodations Don't Transfer",cat:'EQUITY',sev:'high',impact:'Students with disabilities must reapply for DSPS at Teaching College. Accommodations not carried over automatically.',who:'Students with disabilities, DSPS offices',approach:'Make DSPS steps impossible to miss in docs. Coordinate with campus DSPS contacts. Flag as equity gap.'},
{n:4,ticketPct:24,title:'Drop-for-Nonpayment Timing Mismatch',cat:'TIMING',sev:'high',impact:'Teaching College drop-for-nonpayment runs before Exchange payment sync or FA Consortium Agreement processing completes. Students have 3 payment paths (credit card, CCPG at Teaching College, or FA via Home College) — the latter two take time that the auto-drop doesn\'t account for.',who:'Students relying on financial aid, low-income, first-generation',approach:'Frame as timing gap, not campus fault. Offer both-sides fix. Document for de-escalation.'},
{n:5,ticketPct:13,title:"CCPG Fee Waiver Doesn't Auto-Transfer",cat:'COMMS',sev:'med',impact:'California College Promise Grant at Home College doesn\'t carry to Teaching College. Must reapply separately. Many get unexpected bills.',who:'Low-income students eligible for fee waivers',approach:'Ensure prominently documented. Recommend proactive start-of-term communication if tickets cluster.'},
{n:6,ticketPct:6,title:'Residency Validation Is Manual',cat:'DATA',sev:'med',impact:'Home College A&R must manually confirm residency. Delays result in incorrect out-of-state fees at Teaching College.',who:'Students with residency data issues, A&R staff',approach:'Track incorrect fee tickets. Correlate with specific Home Colleges. Document workaround.'},
{n:7,ticketPct:4,title:'FA Dashboard Incomplete for Ethos SIS',cat:'VENDOR',sev:'med',impact:'Spring 2025 FA Dashboard automates unit recording for PeopleSoft and Banner Direct colleges. Banner Ethos and Colleague Ethos integration is pending Ellucian development prioritization — those FA offices still use the manual email workflow.',who:'FA offices at Ethos colleges',approach:'Know which colleges are on which SIS tier. Document workarounds. Update campuses on status.'},
{n:8,ticketPct:3,title:'MIS Reporting Requires Manual Reconciliation',cat:'FISCAL',sev:'med',impact:"Exchange data doesn't map cleanly to MIS requirements. Manual reconciliation needed. Underreporting = lost funding.",who:'Institutional Research (IR) and Admissions & Records (A&R) staff at Teaching Colleges',approach:'Treat MIS tickets as high priority — fiscal, not just technical. Escalate patterns.'},
{n:9,ticketPct:5,title:'No Waitlist Support on Exchange',cat:'PRODUCT',sev:'low',impact:"Students can't join a waitlist. Some courses show '1 seat' reserved for local waitlist, causing registration errors.",who:'Students searching for high-demand courses',approach:'Document limitation clearly. Flag ticket spikes around specific courses.'},
{n:10,ticketPct:10,title:'OpenCCC/SAML Gaps Block Authentication',cat:'AUTH',sev:'low',impact:'CCC IdP Proxy requires CCCID as a SAML attribute from the college IdP. If the college can\'t assert CCCID, the proxy redirects to the Open California Community Colleges (OpenCCC) account recovery — but this often fails silently or confuses students who already have accounts.',who:'Students at misconfigured colleges',approach:'Trace to IdP Proxy layer: is college passing CCCID? Is the eduPerson Principal Name (EPPN) to CCCID mapping correct? Maintain college-by-college SSO status. Coordinate with CCC Tech Center (staffsupportccctc@openccc.zendesk.com).'}
];

// ═══ LIFECYCLE FLOW DATA ═══
var lcData=[
{step:'01',name:'Search',sub:'Find course',barriers:[],cls:'lc-ok'},
{step:'02',name:'Auth',sub:'CCCID via IdP Proxy',barriers:[{t:'#10 IdP/CCCID',c:'tag-blue'}],cls:'lc-warn'},
{step:'03',name:'Eligibility',sub:'Prereqs, GPA',barriers:[{t:'#2 Prereqs',c:'tag-red'},{t:'#6 Residency',c:'tag-amber'}],cls:'lc-err'},
{step:'04',name:'Enroll',sub:'AER → SIS',barriers:[{t:'#9 Waitlist',c:'tag-blue'}],cls:'lc-warn'},
{step:'05',name:'Payment',sub:'CC / CCPG / FA',barriers:[{t:'#4 Drop',c:'tag-red'},{t:'#5 CCPG',c:'tag-amber'}],cls:'lc-err'},
{step:'06',name:'FA Process',sub:'Consortium',barriers:[{t:'#7 Dashboard',c:'tag-amber'}],cls:'lc-warn'},
{step:'07',name:'Canvas',sub:'Provisioned',barriers:[],cls:'lc-ok'},
{step:'08',name:'Attend',sub:'Show up?',barriers:[{t:'#1 No-show',c:'tag-red'},{t:'#3 DSPS',c:'tag-red'}],cls:'lc-err'},
{step:'09',name:'MIS',sub:'SX07 + SF',barriers:[{t:'#8 SX07',c:'tag-amber'}],cls:'lc-warn'}
];

// ═══ CAMPUS MATRIX DATA ═══
// Renamed from `colleges` to `matrixColleges` to avoid collision with `collegeDB`
var matrixColleges=[
{name:'Foothill College',sis:'Banner Direct',fa:'Full (automated)',sso:'Active',issues:[]},
{name:'De Anza College',sis:'Banner Direct',fa:'Full (automated)',sso:'Active',issues:[]},
{name:'Ohlone College',sis:'Colleague Ethos',fa:'Manual (Ethos pending)',sso:'Active',issues:['No-show drops','Financial aid email workflow']},
{name:'West Valley College',sis:'Banner Ethos',fa:'Manual (Ethos pending)',sso:'Active',issues:['Financial aid uses email workflow']},
{name:'Mission College',sis:'Banner Ethos',fa:'Manual (Ethos pending)',sso:'Student ID gap',issues:['Financial aid uses email workflow','IdP Proxy']},
{name:'Skyline College',sis:'PeopleSoft',fa:'Full (automated)',sso:'Active',issues:[]},
{name:'Cañada College',sis:'PeopleSoft',fa:'Full',sso:'Active',issues:[]},
{name:'Chabot College',sis:'PeopleSoft',fa:'Full',sso:'Active',issues:[]},
{name:'Gavilan College',sis:'Colleague Ethos',fa:'Pending',sso:'Active',issues:['Financial aid manual']},
{name:'Las Positas',sis:'PeopleSoft',fa:'Full (automated)',sso:'Student ID gap',issues:['Student ID mapping mismatch']},
{name:'Cabrillo College',sis:'Colleague Ethos',fa:'Pending',sso:'Active',issues:['FA manual','Residency']},
{name:'Hartnell College',sis:'Banner Direct',fa:'Full',sso:'Active',issues:[]}
];

// ═══ EQUITY SCORER DATA ═══
var eqData=[
{title:'Drop-for-Nonpayment Timing',score:9,pop:'Low-income, FA-dependent',pct:90,reason:"Can't pay upfront while waiting for FA. Dropped from classes they intend to pay for.",cls:'high'},
{title:'DSPS Accommodations Gap',score:9,pop:'Students with disabilities',pct:90,reason:'Must navigate second bureaucracy at a college they\'ve never visited.',cls:'high'},
{title:'CCPG Fee Waiver Gap',score:8,pop:'Low-income, first-generation',pct:80,reason:'Unexpected bills for students who assumed fee waiver carried over.',cls:'high'},
{title:'Prerequisite Verification',score:7,pop:'Transfer-track students',pct:70,reason:'Manual process deters first-gen students who don\'t know to ask.',cls:'med'},
{title:'No-Show Manual Drops',score:6,pop:'Teaching College staff + waitlisted students',pct:60,reason:'Seats occupied by no-shows block local students.',cls:'med'},
{title:'FA Dashboard Ethos Gap',score:6,pop:'Students at Banner Ethos + Colleague Ethos colleges',pct:60,reason:'FA offices at Ethos colleges still use the manual email workflow while Banner Direct and PeopleSoft colleges have the automated dashboard.',cls:'med'},
{title:'Residency Delays',score:5,pop:'Students with address changes',pct:50,reason:'Incorrect fee charges create confusion and financial stress.',cls:'low'},
{title:'CCCID / IdP Proxy Blocks',score:4,pop:'Students at colleges not asserting CCCID',pct:40,reason:'IdP Proxy redirect to OpenCCC confuses students who already have accounts. Silent failures when EPPN-to-CCCID mapping breaks.',cls:'low'}
];

// ═══ TICKET CORRELATOR DATA ═══
var corrData=[
{label:'Payment & FA timing',count:127,pct:24,cls:'cb-red'},
{label:'No-show / manual drops',count:98,pct:18,cls:'cb-amber'},
{label:'Prerequisite clearance',count:84,pct:16,cls:'cb-purple'},
{label:'CCPG / fee confusion',count:71,pct:13,cls:'cb-amber'},
{label:'Authentication / SSO',count:52,pct:10,cls:'cb-blue'},
{label:'DSPS accommodation',count:38,pct:7,cls:'cb-red'},
{label:'Residency validation',count:31,pct:6,cls:'cb-teal'},
{label:'MIS / reporting',count:18,pct:3,cls:'cb-purple'},
{label:'Other',count:16,pct:3,cls:'cb-blue'}
];
