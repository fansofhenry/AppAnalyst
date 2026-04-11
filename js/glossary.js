// ═══════════════════════════════════════════════════════
// CVC GLOSSARY — Plain-language definitions of the terms
// you'll hear in and around the CVC Exchange. Useful to all
// roles; surfaced as a standalone section with search.
// ═══════════════════════════════════════════════════════

var GLOSSARY_TERMS = [
  {
    term: 'AER',
    long: 'Automated Enrollment Reporting',
    body: 'The process that sends enrollment records from a home college\u2019s SIS to the CVC Exchange. When AER works, enrollments post automatically. When it fails, you see stuck records in the Exchange dashboard that need manual intervention.',
    tags: ['integration', 'technical']
  },
  {
    term: 'CCCID',
    long: 'California Community Colleges ID',
    body: 'The unique student identifier across the California Community Colleges system. Assigned once in OpenCCC and used everywhere: CVC Exchange, CCCApply, Canvas SSO. Always prefer CCCID over name or email for identity lookups \u2014 two students can share a name, but no two share a CCCID.',
    tags: ['identity']
  },
  {
    term: 'CCCApply',
    long: 'California Community Colleges Apply',
    body: 'The online application system for CCCs. Run by CCCTC (California Community Colleges Technology Center). Delivered into SIS via the SuperGlue integration layer. Entry point for most new students.',
    tags: ['student-facing', 'integration']
  },
  {
    term: 'CCPG',
    long: 'California College Promise Grant (formerly BOG Fee Waiver)',
    body: 'A state-funded fee waiver covering enrollment fees for eligible CCC students. Granted at the home college. For Exchange courses, CCPG should transfer automatically once a Consortium Agreement is in place.',
    tags: ['financial aid']
  },
  {
    term: 'Consortium Agreement',
    long: 'Financial Aid Consortium Agreement',
    body: 'A formal agreement between two CCCs that allows a student\u2019s financial aid from the home college to cover courses taken at a teaching college through the Exchange. Must be set up BEFORE the add deadline. This is the #1 FA gap for Exchange students.',
    tags: ['financial aid']
  },
  {
    term: 'CVC',
    long: 'California Virtual Campus',
    body: 'The brand under which the CCC Chancellor\u2019s Office runs the Online Education Initiative (OEI) and the Exchange. Cvc.edu is the student-facing homepage. Sometimes written "CVC-OEI".',
    tags: ['organization']
  },
  {
    term: 'CVC Exchange',
    long: 'CVC Cross-Enrollment Exchange',
    body: 'The systemwide course-sharing platform that lets a student enrolled at any of the 115+ CCCs instantly enroll in an online course at another participating college without a separate application. "The Exchange" for short.',
    tags: ['platform']
  },
  {
    term: 'CSSO',
    long: 'Chief Student Services Officers',
    body: 'The statewide association of Student Services leaders across the CCCs. The CSSO listserv is a common channel for Exchange-related announcements and cross-college coordination.',
    tags: ['organization']
  },
  {
    term: 'Ethos',
    long: 'Ellucian Ethos APIs',
    body: 'Ellucian\u2019s modern integration platform for Banner and Colleague. "Banner Ethos" and "Colleague Ethos" variants of a college\u2019s SIS use Ethos APIs for integrations. As of April 2025, Ethos integrations to the CVC Exchange do NOT yet support direct unit-recording \u2014 meaning manual reconciliation is required.',
    tags: ['integration', 'technical']
  },
  {
    term: 'Ellucian',
    long: 'Ellucian (the vendor)',
    body: 'The company that makes Banner and Colleague, two of the three major SIS platforms used by CCCs (the third being Oracle PeopleSoft). Ellucian support is the escalation path for most Banner/Colleague integration issues.',
    tags: ['vendor']
  },
  {
    term: 'Home College',
    long: 'Home college',
    body: 'The college where a student is formally enrolled \u2014 where they have a student ID, pay fees, receive financial aid, and earn their degree. The home college is the authoritative source for the student\u2019s record when they use the Exchange.',
    tags: ['core concept']
  },
  {
    term: 'Teaching College',
    long: 'Teaching college',
    body: 'The college that delivers the course a student takes through the Exchange. The teaching college manages Canvas access, the class roster, and the instructor. But it does NOT manage the student\u2019s financial aid or degree \u2014 that stays at the home college.',
    tags: ['core concept']
  },
  {
    term: 'OpenCCC',
    long: 'OpenCCC student account',
    body: 'The systemwide student identity and authentication system for the CCCs. Students create an OpenCCC account once and use it to apply to any CCC via CCCApply, sign into the Exchange, and access partner tools. The CCCID is generated here.',
    tags: ['identity', 'student-facing']
  },
  {
    term: 'SIS',
    long: 'Student Information System',
    body: 'The database and software system where a college tracks student enrollment, grades, financial aid, and transcripts. The three main SIS platforms at CCCs are Ellucian Banner, Ellucian Colleague, and Oracle PeopleSoft. Each has different integration characteristics with the Exchange.',
    tags: ['technical']
  },
  {
    term: 'SuperGlue',
    long: 'SuperGlue (CCCApply integration layer)',
    body: 'The integration middleware that delivers CCCApply application data into CCC SIS platforms. Run by CCCTC. If a student\u2019s application isn\u2019t showing up at a college, SuperGlue is often the layer in question.',
    tags: ['integration', 'technical']
  },
  {
    term: 'CCCTC',
    long: 'California Community Colleges Technology Center',
    body: 'The statewide technology center that operates CCCApply, SuperGlue, and other shared infrastructure. Separate from the CCC Chancellor\u2019s Office and from CVC-OEI, though they coordinate closely.',
    tags: ['organization']
  },
  {
    term: 'Canvas',
    long: 'Instructure Canvas',
    body: 'The learning management system (LMS) used by every CCC. Students access their Exchange courses through the teaching college\u2019s Canvas instance after enrollment syncs through.',
    tags: ['platform']
  },
  {
    term: 'R2T4',
    long: 'Return of Title IV Funds',
    body: 'A federal financial aid calculation that happens when a student withdraws during a term. The home college performs the R2T4 calculation using the student\u2019s total enrolled units \u2014 including any Exchange courses \u2014 to determine how much aid must be returned.',
    tags: ['financial aid', 'technical']
  },
  {
    term: 'DSPS',
    long: 'Disabled Students Programs and Services',
    body: 'The college office that coordinates accommodations and accessibility services for students with disabilities. For Exchange students, accommodations do NOT auto-transfer \u2014 the student must contact both the home and teaching college DSPS offices.',
    tags: ['student services']
  },
  {
    term: 'A&R',
    long: 'Admissions and Records',
    body: 'The college office that manages enrollment records, transcripts, and registration. A&R at each college receives Exchange enrollment records for students enrolled as a teaching college and posts records for students taking Exchange courses as a home college.',
    tags: ['student services']
  },
  {
    term: 'ASSIST',
    long: 'ASSIST (Articulation System Stimulating Interinstitutional Student Transfer)',
    body: 'California\u2019s official articulation system showing which courses transfer between CCCs and to CSU/UC. Used by counselors to verify whether an Exchange course will satisfy a requirement at the student\u2019s transfer destination.',
    tags: ['transfer', 'counselor']
  },
  {
    term: 'IdP',
    long: 'Identity Provider',
    body: 'A system that authenticates users for single sign-on (SSO). Each CCC runs its own IdP for local accounts. SAML and OAuth2 are common IdP protocols. When "the IdP is down" you can\u2019t sign in.',
    tags: ['technical']
  },
  {
    term: 'P1 / P2 / P3',
    long: 'Priority tiers for incidents',
    body: 'Informal priority tiers used in support ticket systems. P1 = multiple colleges down, drop everything. P2 = one college degraded, respond within hours. P3 = individual student issue or known limitation, handle within a business day.',
    tags: ['support']
  }
];

var GLOSSARY_SEARCH = '';

function glossaryEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function glossarySetSearch(q) {
  GLOSSARY_SEARCH = q || '';
  glossaryRender();
}

function glossaryRender() {
  var container = document.getElementById('glossaryBody');
  if (!container) return;

  var q = GLOSSARY_SEARCH.trim().toLowerCase();
  var filtered = q
    ? GLOSSARY_TERMS.filter(function(t) {
        var hay = (t.term + ' ' + t.long + ' ' + t.body + ' ' + t.tags.join(' ')).toLowerCase();
        return hay.indexOf(q) >= 0;
      })
    : GLOSSARY_TERMS;

  // Sort alphabetically
  filtered = filtered.slice().sort(function(a, b) { return a.term.localeCompare(b.term); });

  var search = '<div class="gloss-search-wrap">' +
    '<input class="gloss-search" type="text" placeholder="Search the glossary..." oninput="glossarySetSearch(this.value)" value="' + glossaryEsc(GLOSSARY_SEARCH) + '">' +
    '<span class="gloss-count">' + filtered.length + ' / ' + GLOSSARY_TERMS.length + ' terms</span>' +
  '</div>';

  if (filtered.length === 0) {
    container.innerHTML = search + '<div class="gloss-empty">No terms match "' + glossaryEsc(q) + '".</div>';
    return;
  }

  var html = search + '<div class="gloss-list">';
  filtered.forEach(function(t) {
    html += '<div class="gloss-item" id="gloss-' + glossaryEsc(t.term.toLowerCase().replace(/[^a-z0-9]/g, '-')) + '">' +
      '<div class="gloss-term-row">' +
        '<span class="gloss-term">' + glossaryEsc(t.term) + '</span>' +
        '<span class="gloss-long">' + glossaryEsc(t.long) + '</span>' +
        '<span class="gloss-tags">' + t.tags.map(function(tag) { return '<span class="gloss-tag">' + glossaryEsc(tag) + '</span>'; }).join('') + '</span>' +
      '</div>' +
      '<div class="gloss-body">' + t.body + '</div>' +
    '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

glossaryRender();
