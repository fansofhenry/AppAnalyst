// ═══════════════════════════════════════════════════════
// FOR COUNSELORS — Triage workflows for the most common
// "a student came to me with..." situations involving the
// CVC Exchange. Also useful for A&R, FA, DSPS front-desk.
// ═══════════════════════════════════════════════════════

var COUNSELOR_SCENARIOS = [
  {
    id: 'missing-course',
    category: 'Enrollment',
    trigger: 'I enrolled in a class through CVC but it\u2019s not in my Canvas',
    first: 'Ask when they enrolled. If <24 hours, reassure \u2014 sync can take time. If 24\u201372 hours, escalate.',
    steps: [
      'Confirm the student enrolled through cvc.edu, not directly at the teaching college',
      'Ask which teaching college the course is at',
      'Check your home college\u2019s SIS for the Exchange enrollment record — should show up as "CVC Exchange" or similar',
      'If the record is there, the issue is on the teaching college / Canvas side — contact their A&R',
      'If the record is NOT there, the issue is the Exchange → home SIS sync — escalate to your IT/App Support Analyst'
    ],
    escalate: 'App Support Analyst or ETS → if the pattern affects multiple students',
    say: 'Your enrollment is safe. This is a sync issue between systems, not a problem with your registration. Let me check on our end and I\u2019ll update you today.'
  },
  {
    id: 'fa-not-covering',
    category: 'Financial Aid',
    trigger: 'My financial aid isn\u2019t covering my CVC course',
    first: 'Ask if they have a <strong>Consortium Agreement</strong> set up. If no, that\u2019s the whole answer.',
    steps: [
      'Confirm they have an active FA file at your college (home college) for this term',
      'Check whether a Consortium Agreement has been initiated with the teaching college for this specific course',
      'If not, the student needs to visit your FA office before the add deadline',
      'If yes, verify the agreement was accepted and the disbursement schedule includes the Exchange course units'
    ],
    escalate: 'FA Director → if the Consortium Agreement is refused or delayed past the add deadline',
    say: 'Financial aid for Exchange courses needs a Consortium Agreement. It\u2019s a one-time setup with Financial Aid — I\u2019ll walk you over or email them for you. We need to do this before [add deadline].'
  },
  {
    id: 'accommodation',
    category: 'DSPS',
    trigger: 'I have DSPS accommodations and need them at the teaching college',
    first: 'Explain that accommodations don\u2019t auto-transfer. Student needs to contact teaching college DSPS directly.',
    steps: [
      'Confirm they\u2019re active with DSPS at your (home) college',
      'Get the teaching college DSPS contact info — most colleges list it on their DSPS page',
      'Help the student draft an email to teaching college DSPS explaining: they\u2019re a CVC Exchange student from [your college], they have active accommodations, and they want to share their accommodation letter',
      'Offer to help them request a copy of their accommodation letter from your DSPS office',
      'Remind them: contact BEFORE the course starts when possible'
    ],
    escalate: 'Your DSPS Coordinator → to initiate coordinator-to-coordinator contact if the student has been unable to reach teaching college DSPS',
    say: 'Your accommodations are valid and recognized, but each college processes them through their own DSPS office. Let\u2019s get you connected to DSPS at the teaching college today so they can set things up before your class starts.'
  },
  {
    id: 'dropped-wrong',
    category: 'Enrollment',
    trigger: 'I dropped my CVC course but I\u2019m still being charged / it still shows up',
    first: 'Ask HOW they dropped it. Must be through cvc.edu, not the teaching college\u2019s portal.',
    steps: [
      'Verify they used the drop option on cvc.edu, not the teaching college\u2019s direct drop',
      'Check your home college\u2019s SIS for the drop record',
      'If the drop didn\u2019t go through Exchange, the student is still enrolled — they need to drop via cvc.edu immediately',
      'If deadline has passed, W (withdrawal) or partial refund rules depend on the teaching college\u2019s calendar',
      'Document the timestamp of the original drop attempt in case they need to appeal'
    ],
    escalate: 'A&R Director → if within-deadline drop failed and refund is at stake',
    say: 'Let\u2019s figure out exactly what happened. The drop has to go through cvc.edu so both colleges get notified. Walk me through what you clicked on.'
  },
  {
    id: 'exchange-basics',
    category: 'Advising',
    trigger: 'My class is full at our college — can I take it somewhere else?',
    first: 'Yes, and it\u2019s designed for exactly this. Walk them through cvc.edu.',
    steps: [
      'Open <a href="https://search.cvc.edu" target="_blank" rel="noopener">search.cvc.edu</a> together',
      'Search for the specific course — e.g., "Math 1A"',
      'Review open sections at other CCCs, comparing modality, start date, and schedule',
      'Check ASSIST if they\u2019re on a transfer track — confirm the course will satisfy their requirement at the destination',
      'Walk through the enroll flow so they know what to expect',
      'Remind them about FA Consortium Agreement if they\u2019re using aid, and DSPS coordination if applicable'
    ],
    escalate: 'Not typically needed unless the student has complex transfer requirements',
    say: 'The CVC Exchange lets you enroll in online classes at any California community college \u2014 instantly, without a separate application. Let\u2019s find your course together. One thing to know: if you\u2019re using financial aid, we need to set up a Consortium Agreement first.'
  },
  {
    id: 'wrong-college',
    category: 'Identity',
    trigger: 'The system thinks I\u2019m a student at the wrong college',
    first: 'Ask where they first enrolled. Their home college is determined by OpenCCC history.',
    steps: [
      'Confirm their OpenCCC account (cccapply.org login)',
      'Check which college(s) appear in their OpenCCC application history',
      'If they\u2019ve applied to multiple colleges, they may need to select the correct home college at Exchange sign-in',
      'If the wrong college is designated, contact the correct home college\u2019s A&R to verify their enrollment and update OpenCCC records'
    ],
    escalate: 'Your A&R or the IT help desk for an identity remap',
    say: 'Your home college is determined by where you\u2019re actively enrolled. Let\u2019s look at your applications and make sure the Exchange is pointing to the right one.'
  }
];

function counselorsEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function counselorsRender() {
  var container = document.getElementById('forCounselorsBody');
  if (!container) return;

  var categories = {};
  COUNSELOR_SCENARIOS.forEach(function(s) {
    if (!categories[s.category]) categories[s.category] = [];
    categories[s.category].push(s);
  });

  var html = '<div class="cnl-grid">';
  Object.keys(categories).forEach(function(cat) {
    html += '<div class="cnl-group"><div class="cnl-group-title">' + cat + '</div>';
    categories[cat].forEach(function(s) {
      html += '<div class="cnl-card" onclick="this.classList.toggle(\'cnl-expanded\')">' +
        '<div class="cnl-trigger">' +
          '<span class="cnl-quote">&ldquo;</span>' +
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

  // Quick reference card
  html += '<div class="cnl-quickref">' +
    '<h3>Quick reference &mdash; always safe to say</h3>' +
    '<ul>' +
      '<li><strong>The student\u2019s enrollment is valid.</strong> Sync delays don\u2019t mean they\u2019re not enrolled.</li>' +
      '<li><strong>Their home college is their base.</strong> Financial aid, transcripts, fees, and most holds live there, not at the teaching college.</li>' +
      '<li><strong>Drops go through cvc.edu</strong>, not the teaching college\u2019s portal. This is the #1 drop mistake.</li>' +
      '<li><strong>DSPS accommodations don\u2019t auto-transfer.</strong> Students must contact the teaching college DSPS separately.</li>' +
      '<li><strong>Financial aid needs a Consortium Agreement.</strong> Set it up at the home college BEFORE the add deadline.</li>' +
      '<li><strong>When in doubt, open a ticket with your App Support Analyst.</strong> They can trace the issue across systems in ways you can\u2019t from the front desk.</li>' +
    '</ul>' +
  '</div>';

  container.innerHTML = html;
}

window.addEventListener('appanalyst:role-change', counselorsRender);
counselorsRender();
