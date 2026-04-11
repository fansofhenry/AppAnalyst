// ═══════════════════════════════════════════════════════
// FOR A&R / FA / DSPS — Role-specific workflow sections
// mirroring the Counselor pattern. Each section has
// scenario cards grouped by category.
// ═══════════════════════════════════════════════════════

var AR_SCENARIOS = [
  {
    category: 'Inbound enrollment records',
    trigger: 'An Exchange enrollment came in but the student isn\u2019t in our SIS yet',
    first: 'Check whether your SIS applies Exchange records in real-time, batch, or manual. Banner Ethos and Colleague Ethos tiers are most prone to this.',
    steps: [
      'Look up the student by CCCID in your SIS to confirm any prior record',
      'Check the Exchange Admin Dashboard for the authoritative record + status',
      'If your college is on Banner/Colleague Ethos: the enrollment likely needs manual posting today',
      'If your college is on Banner Direct / PeopleSoft: the enrollment should have auto-posted — escalate to IT',
      'Post manually if needed and tag the ticket for your App Support Analyst to track the pattern'
    ],
    escalate: 'Your ETS / IT team \u2192 if the gap is repeated or affects >1 student',
    say: 'The Exchange has the record. Our SIS just needs a manual posting because of how our integration is set up. I\u2019ll handle it today.'
  },
  {
    category: 'Inbound enrollment records',
    trigger: 'A student appears in our roster with a "CVC Exchange" flag but I don\u2019t recognize the course',
    first: 'That flag means the student is enrolled at our college through the Exchange as their teaching college. Confirm this is intentional.',
    steps: [
      'Look up the course code/section in your schedule — confirm it exists and is available to Exchange students',
      'Check the student\u2019s home college (shown on the record) to verify they\u2019re legitimately enrolled there',
      'Confirm the Consortium Agreement is on file if FA is involved',
      'No action needed unless there\u2019s a discrepancy — this is a normal Exchange enrollment'
    ],
    escalate: 'Not typically needed',
    say: 'This is a student from [home college] taking our course through the CVC Exchange. Their home college handles their aid and records; we just teach the course.'
  },
  {
    category: 'Reconciliation',
    trigger: 'Our monthly reconciliation shows Exchange and SIS don\u2019t match',
    first: 'Use the Reconciliation Helper in this workbench or export both rosters to CSV and diff them.',
    steps: [
      'Export the Exchange Admin Dashboard roster for the term + Export your SIS roster filtered by "CVC Exchange" tag',
      'Paste both into the Reconciliation Helper (&rarr; Section ⇄ Reconcile)',
      'Investigate each flagged mismatch individually — missing, wrong units, wrong term',
      'Post corrections manually in SIS or escalate to vendor if pattern suggests integration issue',
      'Document the gap count per term in a KB entry for your manager'
    ],
    escalate: 'Your IT team if >5% of records mismatch',
    say: 'We have a reconciliation gap of N records this month. Most are manual-posting delays, not data loss. Here\u2019s the list.'
  },
  {
    category: 'Identity',
    trigger: 'Two students have the same name and I\u2019m not sure which one is the Exchange student',
    first: 'CCCID is the authoritative identifier. Never trust name alone.',
    steps: [
      'Pull the CCCID from the Exchange Admin Dashboard record',
      'Match to SIS by CCCID, not name or birthdate',
      'If your SIS stores CCCID as an alternate ID, use that field for lookup',
      'If it doesn\u2019t, consider adding CCCID storage as a standing request to IT'
    ],
    escalate: 'Your IT team for identity mapping issues',
    say: 'The CCCID is the unique identifier we rely on for Exchange students. Let me grab that and look them up.'
  }
];

var FA_SCENARIOS = [
  {
    category: 'Consortium Agreements',
    trigger: 'A student wants FA for a course at another CCC through the Exchange',
    first: 'They need a Consortium Agreement on file BEFORE the add deadline. Start today.',
    steps: [
      'Confirm student has an active FA file at your (home) college for this term',
      'Verify the Exchange course count and units \u2014 will these be added to their FA load calculation?',
      'Draft the Consortium Agreement with the teaching college (use your standard form)',
      'Get student signature, send to teaching college FA, file a copy',
      'Update the student\u2019s FA load and re-run Pell/CCPG calculations',
      'Confirm disbursement schedule reflects the Exchange units'
    ],
    escalate: 'FA Director \u2192 if the agreement is rejected or delayed past the add deadline',
    say: 'We can absolutely use your financial aid for this course. It requires a one-time agreement between our two FA offices. I\u2019ll start it today — we need it on file by [add deadline].'
  },
  {
    category: 'CCPG / fee waivers',
    trigger: 'Student\u2019s CCPG fee waiver didn\u2019t transfer to the Exchange course',
    first: 'CCPG is granted at the home college and should apply. If it didn\u2019t, the Consortium Agreement may not have been set up.',
    steps: [
      'Confirm active CCPG eligibility at your home college for this term',
      'Check whether a Consortium Agreement exists for this specific Exchange course',
      'If no agreement: set one up immediately (see above workflow)',
      'If agreement exists: contact teaching college FA and ask them to apply the waiver based on the agreement',
      'If the add deadline has passed and the student has paid out-of-pocket, investigate refund options'
    ],
    escalate: 'FA Director for refund processing',
    say: 'Your fee waiver is valid. It didn\u2019t apply automatically because of how Exchange courses flow between colleges. Let me make sure your Consortium Agreement is set up correctly so this is resolved today.'
  },
  {
    category: 'Disbursement',
    trigger: 'Pell disbursement ran but the student says it\u2019s short',
    first: 'Likely cause: Exchange course units weren\u2019t included in the load calculation at disbursement time.',
    steps: [
      'Check the student\u2019s enrollment load AS CALCULATED at last disbursement run',
      'Compare to the current load including Exchange units',
      'Verify the Consortium Agreement was filed and units were reported to your FA system in time',
      'If the difference is real, file a supplemental disbursement request',
      'Document the timing gap for future terms \u2014 common pattern at census'
    ],
    escalate: 'FA Director for supplemental disbursements',
    say: 'Your Exchange course units were added to your load, but after the last disbursement ran. We\u2019ll process a supplemental disbursement to make up the difference.'
  },
  {
    category: 'R2T4',
    trigger: 'Student withdrew from an Exchange course mid-term; R2T4 rules seem unclear',
    first: 'R2T4 is calculated by the home college based on total enrolled units (including Exchange).',
    steps: [
      'Get the withdrawal date from the Exchange or teaching college record',
      'Recalculate total enrolled units after withdrawal',
      'Run R2T4 at your home college using the new unit count',
      'If any aid needs to be returned, process through your standard R2T4 workflow',
      'Coordinate with teaching college on any remaining fee liability'
    ],
    escalate: 'FA Director for R2T4 questions',
    say: 'Because this was an Exchange course, R2T4 is calculated at our end \u2014 your home college \u2014 using the total reduced unit count. Let me walk you through what that looks like.'
  }
];

var DSPS_SCENARIOS = [
  {
    category: 'Accommodations across colleges',
    trigger: 'Exchange student needs their accommodations at the teaching college',
    first: 'Accommodations don\u2019t auto-transfer. Get the student connected to teaching college DSPS immediately.',
    steps: [
      'Confirm student is active with DSPS at your (home) college',
      'Prepare a copy of their accommodation letter \u2014 student must consent to share',
      'Help student email teaching college DSPS: introduce themselves, state they\u2019re a CVC Exchange student from [home college], request accommodation setup',
      'Optionally initiate coordinator-to-coordinator contact if the student has been unable to reach teaching college DSPS',
      'Follow up with student after 48 hours to confirm teaching college is responsive'
    ],
    escalate: 'Your DSPS Coordinator if teaching college doesn\u2019t respond in 48 hours',
    say: 'Your accommodations are valid. Each college manages them through their own DSPS office, so we need to loop in the teaching college today. Here\u2019s how we\u2019ll do it together.'
  },
  {
    category: 'Alternative formats',
    trigger: 'Student needs alt-format materials for an Exchange course',
    first: 'Alt-format responsibility sits with whichever college is teaching the course.',
    steps: [
      'Student contacts teaching college DSPS for alternative materials',
      'If teaching college says no or is slow, escalate coordinator-to-coordinator',
      'Home college DSPS can provide general support (assistive tech training, strategies) but alt-format itself belongs to the teaching college',
      'Document timeline in case there\u2019s a question about equal access'
    ],
    escalate: 'Coordinator-to-coordinator, then 504 / ADA compliance if unresolved',
    say: 'Alt-format materials for Exchange courses come from the college teaching the course. Let\u2019s make sure their DSPS office knows what you need, and I\u2019ll back you up if there\u2019s any delay.'
  },
  {
    category: 'Exam accommodations',
    trigger: 'Exchange student needs extended time for a Canvas quiz at the teaching college',
    first: 'Canvas settings live at the teaching college. Instructor must add the time extension.',
    steps: [
      'Student contacts teaching college DSPS with their accommodation letter',
      'Teaching college DSPS notifies the instructor',
      'Instructor sets the time extension on the quiz in Canvas at the teaching college',
      'Home college DSPS can assist with advocacy if there\u2019s a delay, but doesn\u2019t have Canvas access at teaching college'
    ],
    escalate: 'Teaching college DSPS \u2192 instructor \u2192 division dean if unresponsive',
    say: 'Your extended-time accommodation applies here \u2014 the teaching college\u2019s DSPS office needs to notify your instructor so they can set it in Canvas. Let\u2019s reach out to them right now.'
  },
  {
    category: 'DSPS-Exchange coordination',
    trigger: 'Building a regular coordination workflow with partner college DSPS offices',
    first: 'At the start of each term, proactively contact DSPS at your 5-10 highest-volume partner colleges.',
    steps: [
      'Maintain a contact list of DSPS coordinators at your top partner colleges (use the Directory overlay notes to track)',
      'Send a start-of-term "hello, here\u2019s who we work with" email to each',
      'Share your standard accommodation letter format and preferred process',
      'Ask them to share theirs',
      'Track coordination activities as outreach events in this workbench\u2019s Outreach Planner'
    ],
    escalate: 'Not typically needed \u2014 this is proactive',
    say: 'Not a student-facing scenario, but worth building as a habit every term.'
  }
];

function forRolesEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function forRolesRenderScenarios(scenarios, accentColor) {
  var categories = {};
  scenarios.forEach(function(s) {
    if (!categories[s.category]) categories[s.category] = [];
    categories[s.category].push(s);
  });

  var html = '<div class="cnl-grid">';
  Object.keys(categories).forEach(function(cat) {
    html += '<div class="cnl-group"><div class="cnl-group-title" style="color:' + accentColor + ';border-color:' + accentColor + '">' + cat + '</div>';
    categories[cat].forEach(function(s) {
      html += '<div class="cnl-card" onclick="this.classList.toggle(\'cnl-expanded\')">' +
        '<div class="cnl-trigger">' +
          '<span class="cnl-quote" style="color:' + accentColor + '">&ldquo;</span>' +
          '<span class="cnl-trigger-text">' + s.trigger + '</span>' +
        '</div>' +
        '<div class="cnl-detail">' +
          '<div class="cnl-first"><span class="cnl-label">First thing:</span> ' + s.first + '</div>' +
          '<div class="cnl-say-box">' +
            '<div class="cnl-label">What to say</div>' +
            '<div class="cnl-say">&ldquo;' + s.say + '&rdquo;</div>' +
          '</div>' +
          '<div class="cnl-steps-box">' +
            '<div class="cnl-label">Steps</div>' +
            '<ol class="cnl-steps">' +
              s.steps.map(function(step) { return '<li>' + step + '</li>'; }).join('') +
            '</ol>' +
          '</div>' +
          '<div class="cnl-escalate"><span class="cnl-label">Escalate to:</span> ' + s.escalate + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function forARRender() {
  var body = document.getElementById('forARBody');
  if (!body) return;
  body.innerHTML = forRolesRenderScenarios(AR_SCENARIOS, 'var(--blue)');
}

function forFARender() {
  var body = document.getElementById('forFABody');
  if (!body) return;
  body.innerHTML = forRolesRenderScenarios(FA_SCENARIOS, 'var(--amber)');
}

function forDSPSRender() {
  var body = document.getElementById('forDSPSBody');
  if (!body) return;
  body.innerHTML = forRolesRenderScenarios(DSPS_SCENARIOS, 'var(--teal)');
}

window.addEventListener('appanalyst:role-change', function() {
  forARRender();
  forFARender();
  forDSPSRender();
});

forARRender();
forFARender();
forDSPSRender();
