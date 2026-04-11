// ═══════════════════════════════════════════════════════
// QUICK-REFERENCE CARDS — One-page printable cheat sheets
// per role. Launches a popup window ready to print or save
// as PDF. Content assembled from existing glossary +
// scenario + role data.
// ═══════════════════════════════════════════════════════

var QREF_CARDS = {
  analyst: {
    title: 'CVC-OEI Application Support Analyst \u2014 Quick Reference',
    tagline: 'Diagnose, resolve, document, escalate.',
    sections: [
      {
        h: 'Start of day',
        items: [
          'Open the Today dashboard \u2014 check open/aging/urgent counts and follow-ups',
          'Scan the Active colleges view for any tickets that aged overnight',
          'Review any new tickets routed from ETS or campus IT'
        ]
      },
      {
        h: 'When an incident comes in',
        items: [
          'Pick severity: P1 (multi-college down) / P2 (one college degraded) / P3 (individual or known)',
          'Open the Tracer \u2014 walk through Home SIS \u2192 Exchange \u2192 Teaching College \u2192 Canvas',
          'Use the Escalation Helper to draft messages for student / campus IT / registrar / internal / vendor',
          'Log everything in the Ticket Log so the pattern data compounds'
        ]
      },
      {
        h: 'Escalation contacts',
        items: [
          'P1: senior analyst + supervisor simultaneously. Ellucian / CCCTC vendor with case number.',
          'P2: campus IT at affected college. Senior analyst if unclear after 30 min.',
          'P3: handle directly. Escalate only if 48hr deadline at risk.'
        ]
      },
      {
        h: 'Key acronyms',
        items: [
          'AER \u2014 Automated Enrollment Reporting (SIS \u2192 Exchange)',
          'CCCID \u2014 unique student ID across the CCC system',
          'Consortium Agreement \u2014 FA transfer between home/teaching college',
          'Ethos \u2014 Ellucian API tier; still requires manual unit posting',
          'R2T4 \u2014 Return of Title IV Funds on withdrawal'
        ]
      }
    ]
  },
  ar: {
    title: 'A&R Specialist \u2014 CVC Exchange Quick Reference',
    tagline: 'Receive. Reconcile. Escalate.',
    sections: [
      {
        h: 'Inbound Exchange records',
        items: [
          'Look up student by CCCID, not name',
          'Check Exchange Admin Dashboard for authoritative record',
          'If on Banner/Colleague Ethos: expect to post manually',
          'If on Banner Direct / PeopleSoft: should auto-post \u2014 escalate if it didn\u2019t'
        ]
      },
      {
        h: 'Reconciliation workflow',
        items: [
          'Export Exchange Admin Dashboard roster for the term',
          'Export your SIS roster filtered by CVC Exchange tag',
          'Diff with the Reconciliation Helper in this hub',
          'Post corrections; escalate pattern issues to IT'
        ]
      },
      {
        h: 'Say this',
        items: [
          '"Your enrollment is safe. Our SIS just needs a manual posting because of how our integration is set up."',
          '"This is a student from [home college] taking our course through the Exchange. Their home college handles their aid."'
        ]
      }
    ]
  },
  fa: {
    title: 'Financial Aid Officer \u2014 CVC Exchange Quick Reference',
    tagline: 'Consortium Agreement is the whole game.',
    sections: [
      {
        h: 'Consortium Agreement (the #1 thing)',
        items: [
          'Must be on file BEFORE the add deadline',
          'Set up at the home college with the teaching college',
          'Covers Pell, CCPG, SEOG, and load calculation',
          'No agreement = FA does not apply to Exchange course'
        ]
      },
      {
        h: 'CCPG fee waiver transfer',
        items: [
          'CCPG is home-college-granted',
          'Should auto-apply once Consortium Agreement exists',
          'If it didn\u2019t: check the agreement status first'
        ]
      },
      {
        h: 'R2T4 on Exchange withdrawal',
        items: [
          'Home college performs R2T4 \u2014 including Exchange units in total',
          'Calculate based on total enrolled units after withdrawal',
          'Coordinate with teaching college on fee liability'
        ]
      },
      {
        h: 'Say this',
        items: [
          '"We can use your financial aid for this course. It requires a one-time Consortium Agreement. I\u2019ll start it today \u2014 we need it by [add deadline]."'
        ]
      }
    ]
  },
  counselor: {
    title: 'Counselor \u2014 CVC Exchange Quick Reference',
    tagline: 'Six scenarios. Always safe to say: enrollment is valid.',
    sections: [
      {
        h: 'Top 6 scenarios (memorize these)',
        items: [
          'Course not in Canvas \u2192 sync issue, check Exchange dashboard',
          'FA not covering \u2192 Consortium Agreement needed',
          'DSPS doesn\u2019t transfer \u2192 contact teaching-college DSPS',
          'Dropped but still showing \u2192 must drop via cvc.edu',
          'Class full at our college \u2192 search.cvc.edu + ASSIST',
          'Wrong home college on record \u2192 check OpenCCC application history'
        ]
      },
      {
        h: 'Always safe to say',
        items: [
          '"Your enrollment is valid. Sync delays don\u2019t mean you\u2019re not enrolled."',
          '"Your home college is your base \u2014 aid, transcripts, and most holds live there."',
          '"Drops go through cvc.edu, not the teaching college."',
          '"DSPS doesn\u2019t auto-transfer \u2014 contact the teaching college separately."',
          '"Financial aid needs a Consortium Agreement \u2014 set it up before the add deadline."'
        ]
      },
      {
        h: 'Use these links with students',
        items: [
          'search.cvc.edu \u2014 find open sections at other CCCs',
          'cvc.edu \u2014 student dashboard + drops',
          'assist.org \u2014 verify transfer equivalency'
        ]
      }
    ]
  },
  dsps: {
    title: 'DSPS Coordinator \u2014 CVC Exchange Quick Reference',
    tagline: 'Accommodations don\u2019t auto-transfer. Coordinate.',
    sections: [
      {
        h: 'Cross-college accommodations',
        items: [
          'Confirm student is active with DSPS at home college',
          'Prepare accommodation letter for sharing with student consent',
          'Student contacts teaching-college DSPS directly',
          'Initiate coordinator-to-coordinator if student can\u2019t reach teaching college'
        ]
      },
      {
        h: 'Alt-format materials',
        items: [
          'Teaching college owns alt-format responsibility',
          'Home college provides strategies + assistive tech support',
          'Escalate if teaching college delays > 48 hours'
        ]
      },
      {
        h: 'Canvas exam settings',
        items: [
          'Teaching-college DSPS notifies instructor',
          'Instructor sets extended time in Canvas (at teaching college)',
          'Home college can advocate but has no Canvas access'
        ]
      },
      {
        h: 'Proactive (start of each term)',
        items: [
          'Contact DSPS coordinators at top 5-10 partner colleges',
          'Share accommodation letter format + preferred process'
        ]
      }
    ]
  },
  student: {
    title: 'CVC Exchange \u2014 Student Quick Start',
    tagline: 'Your home college is home. The teaching college teaches the course.',
    sections: [
      {
        h: '5-step walkthrough',
        items: [
          '1. Be an active student at a CCC (your "home college")',
          '2. Search for your course at search.cvc.edu',
          '3. Click Enroll, sign in with OpenCCC, pick your home college',
          '4. Wait for confirmation email (minutes to hours)',
          '5. Access the course in your Canvas dashboard'
        ]
      },
      {
        h: 'If something breaks',
        items: [
          'Course not in Canvas \u2192 wait 24 hours, then contact home college A&R',
          'FA not applying \u2192 contact home college FA about a Consortium Agreement',
          'Need DSPS accommodations \u2192 contact teaching college DSPS directly',
          'Want to drop \u2192 use cvc.edu, NOT the teaching college\u2019s portal'
        ]
      },
      {
        h: 'Who to contact',
        items: [
          'Admissions / FA / Counseling \u2192 your home college',
          'Canvas / course content / instructor \u2192 teaching college',
          'DSPS \u2192 both, as needed'
        ]
      }
    ]
  }
};

function qrefPrintCurrent() {
  var role = (typeof roleGet === 'function') ? roleGet() : 'analyst';
  var card = QREF_CARDS[role];
  if (!card) { toast('No quick-ref card for this role'); return; }

  var w = window.open('', 'qref-' + role, 'width=900,height=1100');
  if (!w) { toast('Popup blocked'); return; }

  var dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  var sectionsHtml = card.sections.map(function(s) {
    return '<div class="qref-section"><h3>' + s.h + '</h3><ul>' +
      s.items.map(function(item) { return '<li>' + item + '</li>'; }).join('') +
    '</ul></div>';
  }).join('');

  var styles =
    '<style>' +
    '@media print { @page { size: letter; margin: .6in; } }' +
    'body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:720px;margin:0 auto;padding:1.5rem 1.25rem;color:#1a1815;line-height:1.55;}' +
    '.qref-head{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:.5rem;border-bottom:2px solid #0F766E;margin-bottom:.9rem;}' +
    '.qref-brand{font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:#0F766E;font-weight:700;}' +
    '.qref-date{font-size:.62rem;color:#666;}' +
    'h1{font-size:1.35rem;margin:0 0 .3rem;line-height:1.2;font-weight:700;}' +
    '.qref-tagline{font-size:.85rem;color:#555;font-style:italic;margin-bottom:1.1rem;}' +
    '.qref-section{break-inside:avoid;margin-bottom:1rem;}' +
    'h3{font-size:.9rem;margin:0 0 .4rem;padding-bottom:.2rem;border-bottom:1px solid #ddd;font-weight:700;color:#0F766E;}' +
    'ul{margin:0;padding-left:1.2rem;font-size:.76rem;line-height:1.55;}' +
    'li{margin-bottom:.18rem;}' +
    '.qref-foot{margin-top:1.1rem;padding-top:.5rem;border-top:1px solid #ddd;font-size:.58rem;color:#666;}' +
    '</style>';

  w.document.write(
    '<!DOCTYPE html><html><head><title>' + card.title + '</title>' + styles + '</head><body>' +
      '<div class="qref-head">' +
        '<span class="qref-brand">CVC-OEI Quick Reference</span>' +
        '<span class="qref-date">' + dateStr + '</span>' +
      '</div>' +
      '<h1>' + card.title + '</h1>' +
      '<div class="qref-tagline">' + card.tagline + '</div>' +
      sectionsHtml +
      '<div class="qref-foot">Generated from the CVC-OEI AppAnalyst Hub (fansofhenry.github.io/AppAnalyst). ' +
      'This is a working quick-reference card, not an official CVC-OEI document. ' +
      'Share freely.</div>' +
    '</body></html>'
  );
  w.document.close();
  setTimeout(function() { w.print(); }, 200);
}
