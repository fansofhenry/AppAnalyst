// ═══════════════════════════════════════════════════════
// EXTERNAL TOOLS HUB — Quick-links to the external sites
// you'll actually use day to day. Grouped by audience.
// ═══════════════════════════════════════════════════════

var EXTERNAL_GROUPS = [
  {
    label: 'Student-facing (share with students)',
    audience: ['student', 'counselor'],
    icon: '\u2641',
    links: [
      { name: 'CVC Exchange course search', url: 'https://search.cvc.edu', desc: 'Browse open online courses across all 115+ CCCs' },
      { name: 'CVC main site', url: 'https://cvc.edu', desc: 'Landing page, about, support, FAQs' },
      { name: 'CCCApply', url: 'https://www.cccapply.org', desc: 'CCC application system \u2014 entry point for new students' },
      { name: 'OpenCCC account', url: 'https://www.opencccapply.net', desc: 'Sign in, reset password, manage your CCC identity' },
      { name: 'ASSIST', url: 'https://assist.org', desc: 'Course articulation system \u2014 does this course transfer?' }
    ]
  },
  {
    label: 'Staff tools',
    audience: ['counselor', 'ar', 'fa', 'dsps', 'analyst'],
    icon: '\u25C6',
    links: [
      { name: 'CVC Exchange Admin Dashboard', url: 'https://cvc.edu/exchange/staff', desc: 'Staff-facing management console (requires authentication)' },
      { name: 'CVC staff support page', url: 'https://cvc.edu/support', desc: 'Contacts, release notes, FAQs for staff' },
      { name: 'CVC Exchange training', url: 'https://cvc.edu/exchange/training', desc: 'Training videos and documentation' },
      { name: 'CSSO (statewide listserv + resources)', url: 'https://cccstudentservices.net', desc: 'Chief Student Services Officers of CA CCCs' }
    ]
  },
  {
    label: 'Technical / integration',
    audience: ['analyst'],
    icon: '\u27E8/\u27E9',
    links: [
      { name: 'CCC Technology Center (CCCTC)', url: 'https://ccctechnology.info', desc: 'CCCApply, SuperGlue, shared infrastructure' },
      { name: 'Ellucian support portal', url: 'https://elluciancustomercenter.force.com', desc: 'Banner + Colleague vendor support (requires login)' },
      { name: 'CVC Exchange release notes', url: 'https://cvc.edu/release-notes', desc: 'Integration changes, SIS tier status updates' },
      { name: 'CVC technical documentation', url: 'https://cvc.edu/docs', desc: 'API specs, integration guides, architecture docs' }
    ]
  },
  {
    label: 'California Community Colleges system-wide',
    audience: ['analyst', 'counselor', 'ar', 'fa', 'dsps'],
    icon: '\u2605',
    links: [
      { name: 'CCC Chancellor\u2019s Office', url: 'https://www.cccco.edu', desc: 'System-wide policies, data, governance' },
      { name: 'CCC find a college', url: 'https://www.cccco.edu/Students/Find-a-College', desc: 'Official CCCCO directory of the 115+ colleges' },
      { name: 'CCC data mart', url: 'https://datamart.cccco.edu', desc: 'Enrollment, demographics, outcomes data' },
      { name: 'CalPASS Plus', url: 'https://www.calpassplus.org', desc: 'K-14 student outcomes data' }
    ]
  }
];

function extRender() {
  var container = document.getElementById('externalBody');
  if (!container) return;
  var currentRole = (typeof roleGet === 'function') ? roleGet() : 'analyst';

  var filtered = EXTERNAL_GROUPS.filter(function(g) {
    return g.audience.indexOf(currentRole) >= 0;
  });

  if (filtered.length === 0) filtered = EXTERNAL_GROUPS;

  var html = '<div class="ext-grid">';
  filtered.forEach(function(g) {
    html += '<div class="ext-group">' +
      '<div class="ext-group-head"><span class="ext-group-icon">' + g.icon + '</span><span class="ext-group-label">' + g.label + '</span></div>' +
      '<div class="ext-links">' +
        g.links.map(function(l) {
          return '<a class="ext-link" href="' + l.url + '" target="_blank" rel="noopener">' +
            '<div class="ext-link-main">' +
              '<div class="ext-link-name">' + l.name + ' <span class="ext-link-arrow">\u2197</span></div>' +
              '<div class="ext-link-desc">' + l.desc + '</div>' +
            '</div>' +
            '<div class="ext-link-url">' + l.url.replace(/https?:\/\//, '') + '</div>' +
          '</a>';
        }).join('') +
      '</div>' +
    '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

window.addEventListener('appanalyst:role-change', extRender);
extRender();
