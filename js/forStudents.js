// ═══════════════════════════════════════════════════════
// FOR STUDENTS — Plain-language self-help guide to using
// the CVC Exchange. No technical jargon. Linked from home.
// ═══════════════════════════════════════════════════════

var STUDENT_STEPS = [
  {
    n: 1,
    title: 'Make sure you\u2019re enrolled at your home college',
    body: 'You need an active student record at a California community college before you can use the CVC Exchange. This is your <strong>home college</strong> — where you pay fees, apply for financial aid, and receive your degree. If you haven\u2019t applied yet, start at <a href="https://www.cccapply.org" target="_blank" rel="noopener">cccapply.org</a>.',
    check: 'I have an active student ID at my home college'
  },
  {
    n: 2,
    title: 'Search for your course at cvc.edu',
    body: 'Go to <a href="https://search.cvc.edu" target="_blank" rel="noopener">search.cvc.edu</a>. Type the course you need (e.g., "Math 1A") or browse by subject. Results show you every California community college offering that course online this term, with open seats.',
    check: 'I found a section I want at another college'
  },
  {
    n: 3,
    title: 'Click "Enroll" and sign in with your OpenCCC account',
    body: 'When you find a section, click the Enroll button. You\u2019ll sign in with your <strong>OpenCCC account</strong> — the same one you used for CCCApply. If it asks you to pick your home college, select the one where you\u2019re already a student.',
    check: 'I signed in and selected my home college'
  },
  {
    n: 4,
    title: 'Confirm your enrollment and wait for sync',
    body: 'Once you submit, the Exchange sends your enrollment to both your home college and the teaching college. This can take anywhere from a few minutes to a few hours depending on the systems involved. You\u2019ll get a confirmation email.',
    check: 'I got a confirmation email'
  },
  {
    n: 5,
    title: 'Access the course in Canvas',
    body: 'After sync completes, the course shows up in your <strong>Canvas dashboard</strong>. Sign in at your teaching college\u2019s Canvas site (e.g., <code>canvas.foothill.edu</code>) with your OpenCCC credentials or your college SSO, depending on the college. The course will appear in your list.',
    check: 'The course is in my Canvas'
  }
];

var STUDENT_TROUBLES = [
  {
    symptom: 'My course isn\u2019t showing up in Canvas',
    causes: 'The enrollment data hasn\u2019t finished syncing, or there\u2019s a system delay between colleges.',
    action: 'Wait 24 hours. If it still isn\u2019t there, contact the <strong>Admissions & Records</strong> office at your home college (not the teaching college) and ask them to verify your Exchange enrollment record.'
  },
  {
    symptom: 'I got an error when I tried to enroll',
    causes: 'Common errors: you haven\u2019t completed orientation at your home college, you have a registration hold, the course requires a prerequisite you haven\u2019t met, or the section is full.',
    action: 'Check your home college\u2019s student portal for any holds or blocks. If nothing shows up there, email the Counseling office at your home college with a screenshot of the error.'
  },
  {
    symptom: 'My financial aid isn\u2019t covering the Exchange course',
    causes: 'Your home college needs to set up a <strong>Consortium Agreement</strong> so your aid applies to courses taken at other colleges through the Exchange.',
    action: 'Contact the Financial Aid office at your home college and ask about a Consortium Agreement for your CVC Exchange course. This has to be set up before the add/drop deadline.'
  },
  {
    symptom: 'I need an accommodation (DSPS) at the teaching college',
    causes: 'Accommodations don\u2019t automatically transfer between colleges. You have to register with DSPS at the teaching college.',
    action: 'Email or call the DSPS office at the teaching college as soon as you enroll. Let them know you\u2019re a CVC Exchange student from [your home college] and ask how to share your accommodation letter.'
  },
  {
    symptom: 'I want to drop the Exchange course',
    causes: 'Dropping has to happen through the Exchange, not through the teaching college\u2019s regular drop process.',
    action: 'Go back to <a href="https://cvc.edu" target="_blank" rel="noopener">cvc.edu</a>, sign in, find the course in your dashboard, and use the drop option there. Pay attention to drop deadlines — they follow the teaching college\u2019s calendar.'
  },
  {
    symptom: 'I can\u2019t sign in with my OpenCCC account',
    causes: 'Your OpenCCC password might need a reset, or your home college\u2019s sign-on integration might be temporarily down.',
    action: 'First try <a href="https://www.opencccapply.net" target="_blank" rel="noopener">password recovery</a> on OpenCCC. If that doesn\u2019t work, contact your home college\u2019s IT help desk.'
  }
];

function studentsEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function studentsRender() {
  var container = document.getElementById('forStudentsBody');
  if (!container) return;

  var stepsHtml = '<div class="stu-steps">' +
    STUDENT_STEPS.map(function(s) {
      return '<div class="stu-step">' +
        '<div class="stu-step-num">' + s.n + '</div>' +
        '<div class="stu-step-main">' +
          '<div class="stu-step-title">' + s.title + '</div>' +
          '<div class="stu-step-body">' + s.body + '</div>' +
          '<div class="stu-step-check"><span class="stu-check-box">&#9634;</span> ' + s.check + '</div>' +
        '</div>' +
      '</div>';
    }).join('') +
  '</div>';

  var troublesHtml = '<div class="stu-troubles">' +
    '<h3 class="stu-troubles-title">Troubleshooting &mdash; common problems</h3>' +
    STUDENT_TROUBLES.map(function(t) {
      return '<div class="stu-trouble">' +
        '<div class="stu-trouble-symptom">' + t.symptom + '</div>' +
        '<div class="stu-trouble-row"><span class="stu-trouble-label">Likely cause</span><span>' + t.causes + '</span></div>' +
        '<div class="stu-trouble-row stu-trouble-action"><span class="stu-trouble-label">What to do</span><span>' + t.action + '</span></div>' +
      '</div>';
    }).join('') +
  '</div>';

  var contactsHtml =
    '<div class="stu-contacts">' +
      '<h3 class="stu-contacts-title">Who to contact at each college</h3>' +
      '<div class="stu-contact-grid">' +
        '<div class="stu-contact-card"><div class="stu-contact-role">Admissions & Records</div><div class="stu-contact-body">For enrollment records, transcripts, registration holds, and dropped-course questions. <strong>Start with your home college</strong> for any enrollment or transcript issue.</div></div>' +
        '<div class="stu-contact-card"><div class="stu-contact-role">Financial Aid</div><div class="stu-contact-body">For FAFSA, CCPG (fee waiver), Consortium Agreements, and disbursement. <strong>Only your home college</strong> handles your aid.</div></div>' +
        '<div class="stu-contact-card"><div class="stu-contact-role">Counseling</div><div class="stu-contact-body">For course planning, transfer questions, and help navigating the Exchange. Works closely with your home college.</div></div>' +
        '<div class="stu-contact-card"><div class="stu-contact-role">DSPS</div><div class="stu-contact-body">For accommodations, alternative formats, and accessibility support. Contact <strong>both</strong> home and teaching college DSPS offices.</div></div>' +
        '<div class="stu-contact-card"><div class="stu-contact-role">Instructor</div><div class="stu-contact-body">For questions about course content, assignments, and Canvas. <strong>Contact the instructor at the teaching college</strong> for course-specific questions.</div></div>' +
      '</div>' +
    '</div>';

  container.innerHTML = stepsHtml + troublesHtml + contactsHtml;
}

window.addEventListener('appanalyst:role-change', studentsRender);
studentsRender();
