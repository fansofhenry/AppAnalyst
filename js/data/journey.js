// ═══ STUDENT JOURNEY COMPARISON DATA ═══
var journeySteps = [
  {
    label: 'Course Search',
    ok: { icon: '✓', cls: 'j-ok', text: 'Finds MATH 1A at De Anza with open seats on cvc.edu.', student: 'There it is. Online section, fits my schedule.' },
    broken: { icon: '✓', cls: 'j-ok', text: 'Finds MATH 1A at De Anza with open seats on cvc.edu.',prevent:'Counselor confirmed home college is set correctly on search.cvc.edu before searching.', student: 'There it is. Online section, fits my schedule.' }
  },
  {
    label: 'Enrollment',
    ok: { icon: '✓', cls: 'j-ok', text: 'Clicks "Add Course." Academic Enrollment Record (AER) transmits from Chabot to De Anza. Seat reserved.', student: 'Done! That was easy. It says I\u2019m enrolled.',prevent:'A proactive check-Canvas-within-24-hours reminder at enrollment would catch the silent failure before the student discovers it in class.' },
    broken: { icon: '✓', cls: 'j-ok', text: 'Clicks "Add Course." AER transmits from Chabot \u2014 but Ethos token at Chabot expired overnight.', student: 'Done! That was easy. It says I\u2019m enrolled.',prevent:'A proactive check-Canvas-within-24-hours reminder at enrollment would catch the silent failure before the student discovers it in class.', analyst: 'Monitor would show Chabot\u2019s status as Failing before this student ever tried to enroll.' }
  },
  {
    label: 'Payment',
    ok: { icon: '✓', cls: 'j-ok', text: 'Pays $138 (3 units \u00d7 $46) by credit card. Payment confirmed.', student: 'Paid. I\u2019m set.' },
    broken: { icon: '\u26a0', cls: 'j-warn', text: 'Requests FA through Consortium Agreement. Home college FA office needs to process.', student: 'I requested financial aid. They said it takes a few days.',prevent:'If the counselor explained the payment timing gap at enrollment \u2014 FA takes 3\u20135 days, but drop-for-nonpayment may run in 48 hours \u2014 the student could have paid upfront and been reimbursed later.', analyst: 'If FA processing takes longer than the drop-for-nonpayment window, this student is at risk. Barrier #4.' }
  },
  {
    label: 'Canvas Access',
    ok: { icon: '✓', cls: 'j-ok', text: 'Logs in via home college SSO. Identity Provider (IdP) Proxy resolves the California Community College ID (CCCID). Canvas shows MATH 1A.', student: 'I can see the course in Canvas. First assignment is posted.' },
    broken: { icon: '\u2717', cls: 'j-err', text: 'AER never reached De Anza (Ethos token failure). Canvas roster doesn\u2019t include this student.', student: 'Where\u2019s my course? I enrolled. Canvas shows nothing.',prevent:'The registration checklist tells students to check Canvas within 24 hours. If the course doesn\u2019t appear, contact support immediately \u2014 not a week later.', analyst: 'Tracer isolates the break: Layer 3 (Ethos API). AER payload never left the home college. 47 other students affected.' }
  },
  {
    label: 'Week 1',
    ok: { icon: '✓', cls: 'j-ok', text: 'Attends class. Participates. On track for on-time transfer.', student: 'Class started. I\u2019m keeping up.' },
    broken: { icon: '\u2717', cls: 'j-err', text: 'Student calls home college \u2014 "it\u2019s a CVC problem." Calls teaching college \u2014 "it\u2019s a home college problem." Add deadline is tomorrow.', student: 'Nobody can help me. The deadline is tomorrow. I need this class to transfer.', analyst: 'Own it end to end. Call the home college with transaction data. Escalate for manual override before deadline.', prevent: 'A single clear contact point in the enrollment confirmation \u2014 \u201CIf anything goes wrong, email cvc-support@fhda.edu\u201D \u2014 prevents the 3-call runaround between colleges.' }
  },
  {
    label: 'Resolution',
    ok: { icon: '✓', cls: 'j-ok', text: 'No support interaction needed. Student completes the course. Transcript auto-sent via Parchment.', student: 'I passed. Transcript is at my home college. I can transfer on time.' },
    broken: { icon: '\u26a0', cls: 'j-warn', text: 'CVC support analyst traces the failure (Ethos token), regenerates credentials, flushes the AER queue. Student gets Canvas access 36 hours late.', student: 'I missed the first assignment. I\u2019m already behind. But at least I\u2019m in.', analyst: 'Document root cause. Draft KB article. Add Ethos token expiration to monitoring alerts. This ticket becomes prevention for the next 47.' }
  }
];
