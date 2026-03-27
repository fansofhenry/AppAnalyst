// ═══ AI VISION DATA ═══
var aiData = {
  ops: [
    {
      icon: '\u26a1', title: 'Predict which colleges will fail next',
      desc: 'Ethos tokens expire on schedules. Sync frequency degrades before full failure. A model trained on 12 months of uptime data could flag at-risk colleges 48 hours before outage.',
      today: 'Analyst checks the monitor each morning. Failures are discovered when they happen \u2014 or when a student reports them.',
      after: 'Dashboard shows a "likely to fail in 48 hours" warning for Sacramento City based on token age (27 days / 30-day cycle) + declining sync frequency. Analyst regenerates the token before any student is affected.',
      toolLink: 'monitor', toolName: 'Monitor',
      complexity: 'quick', complexityLabel: 'Quick win \u2014 rule-based, no ML needed',
      signal: 'aic-predict'
    },
    {
      icon: '\u2699', title: 'Auto-classify tickets by root cause',
      desc: 'When 47 tickets say "can\u2019t see my course," a Natural Language Processing (NLP) classifier could separate Ethos failures from IdP issues from teaching college roster delays \u2014 before a human reads a single one.',
      today: 'Analyst reads each ticket, mentally maps symptoms to probable causes, manually tags category. First 30 minutes of every morning.',
      after: 'Natural Language Processing model reads incoming ticket text + pulls CCCID + checks home college SIS type. Auto-tags 80% of tickets. Analyst reviews the remaining 20% and corrects misclassifications \u2014 which improves the model.',
      toolLink: 'patterns', toolName: 'Pattern Analyzer',
      complexity: 'medium', complexityLabel: 'Medium \u2014 needs labeled training data from 6+ months of tickets',
      signal: 'aic-predict'
    },
    {
      icon: '\u23f1', title: 'Forecast ticket surges before they hit',
      desc: 'Spring registration, add/drop, census, FA disbursement \u2014 each generates a predictable spike. A time-series model could forecast volume 2 weeks out.',
      today: 'The team knows "registration week is busy" but can\u2019t quantify how busy or which categories will spike. KB articles get written reactively.',
      after: 'Model predicts: "Week of Feb 3: expect 340% auth ticket increase at Banner colleges based on 3-year pattern." Team pre-publishes KB articles and alerts campus IT contacts the week before.',
      toolLink: 'patterns', toolName: 'Pattern Analyzer',
      complexity: 'quick', complexityLabel: 'Quick win \u2014 3 years of ticket data + academic calendar',
      signal: 'aic-predict'
    },
    {
      icon: '\u26a0', title: 'Detect anomalies across 115+ colleges at 2 AM',
      desc: 'One college generating 5x normal error rate overnight isn\u2019t visible in a morning queue scan. Anomaly detection surfaces it as a single alert, not 47 individual tickets.',
      today: 'Analyst opens the queue at 8:30 AM, sees 47 new tickets, starts reading. Realizes at 9:15 they\u2019re all from the same college. 45 minutes lost.',
      after: 'Alert fires at 2:14 AM: "Chabot College \u2014 error rate 5.2x baseline since 01:00. 47 AER records queued. Probable cause: Ethos token." Analyst starts at 8:30 with the diagnosis already done.',
      toolLink: 'monitor', toolName: 'Monitor',
      complexity: 'quick', complexityLabel: 'Quick win \u2014 standard deviation thresholds on existing data',
      signal: 'aic-predict'
    }
  ],
  student: [
    {
      icon: '\u2605', title: 'Recommend courses that fit the student\u2019s actual ed plan',
      desc: 'Not "here are other MATH 1A sections." Instead: "here are sections that satisfy YOUR specific Cal-GETC Area 2 requirement, at colleges where your CCPG fee waiver transfers, with open seats."',
      today: 'Student searches by subject keyword. Sees 165 Math sections across 78 colleges. No way to filter by "will my financial aid work here?" or "does this count for my specific transfer requirement?"',
      after: 'Search knows the student\u2019s home college, GE pattern, and FA status. Results are ranked by: ed plan fit \u2192 FA compatibility \u2192 schedule match \u2192 quality badges. Student sees 8 relevant options instead of 165.',
      toolLink: 'journey', toolName: 'Student Journey',
      complexity: 'long', complexityLabel: 'Long-term \u2014 requires ed plan integration + FA status API',
      signal: 'aic-equity'
    },
    {
      icon: '\u23f0', title: 'Alert students before they\u2019re dropped for nonpayment',
      desc: 'The system already knows: (a) the student requested FA via Consortium Agreement, (b) the home college FA office processes in 5\u20137 business days, (c) the teaching college auto-drops in 3 days. That math doesn\u2019t work. The alert should fire before the drop, not after.',
      today: 'Student enrolls, requests FA, waits. Teaching college auto-drops them on day 3. Student discovers they lost their seat when Canvas access disappears. Files a ticket.',
      after: 'Day 1 after enrollment: "Your financial aid is being processed but [Teaching College] drops unpaid enrollments in 3 days. Pay now by credit card to hold your seat \u2014 you\u2019ll be reimbursed when FA processes." Zero tickets. Zero dropped students.',
      toolLink: 'barrierOverview', toolName: 'Barrier #4',
      complexity: 'medium', complexityLabel: 'Medium \u2014 needs FA processing time data + teaching college drop policies',
      signal: 'aic-equity'
    },
    {
      icon: '\u2709', title: 'Reach students at the right moment \u2014 not just the same blast',
      desc: 'Students who cross-enrolled before are 3x more likely to do it again. Students on waitlists are ready to act now. Timing the outreach to the student\u2019s context beats a generic email to 50,000.',
      today: 'Outreach is batch: one email to all students at the start of registration. Open rate: ~12%. Students who need the Exchange most may not be the ones who open generic emails.',
      after: 'Triggered messages based on signals: waitlisted for a required course \u2192 "this course is available at 4 other colleges right now." Ed plan shows a gap \u2192 "your counselor flagged ENGL 1A as needed \u2014 here are 12 open sections." Past Exchange user \u2192 personalized nudge at their registration date.',
      toolLink: 'outreach', toolName: 'Outreach Planner',
      complexity: 'medium', complexityLabel: 'Medium \u2014 needs event-triggered messaging infrastructure',
      signal: 'aic-equity'
    },
    {
      icon: '\u2665', title: 'Weight early warnings by who has the least margin for error',
      desc: 'A payment timing issue is an inconvenience for a student with savings. It\u2019s a semester-ending crisis for a first-gen student on CCPG with no backup. The system should know the difference.',
      today: 'All students get the same alerts (if any). First-gen CCPG students and students with savings accounts receive identical treatment from the system.',
      after: 'Risk score combines: first-gen status + CCPG recipient + incomplete FAFSA + no prior Exchange use. Higher-risk students get earlier alerts, simpler payment instructions, and direct counselor routing if the alert goes unread for 24 hours.',
      toolLink: 'equity', toolName: 'Equity Scorer',
      complexity: 'long', complexityLabel: 'Long-term \u2014 requires equity data integration + careful bias auditing',
      signal: 'aic-equity'
    }
  ],
  fraud: [
    {
      icon: '\u26d4', title: 'Detect fraudulent enrollment patterns in cross-enrollment',
      desc: 'Fake CCCIDs created via OpenCCC, used to cross-enroll through the Exchange and claim financial aid through Consortium Agreements. The accounts never attend. The support team sees them as enrollment anomalies.',
      today: 'Fraudulent enrollments look like normal tickets: "student can\u2019t access Canvas." The analyst resolves the technical issue without knowing the underlying account is fraudulent. FA office processes the Consortium Agreement. Revenue is lost.',
      after: 'Pattern detection flags: multiple CCCIDs from the same IP enrolling at 3 AM, accounts with no prior enrollment history instantly cross-enrolling into high-unit courses, FA requests submitted within minutes of enrollment. Analyst reviews flagged accounts before FA is disbursed.',
      toolLink: 'monitor', toolName: 'Monitor',
      complexity: 'medium', complexityLabel: 'Medium \u2014 needs enrollment velocity + IP clustering baseline',
      signal: 'aic-govern'
    },
    {
      icon: '\u2696', title: 'Protect FA revenue without blocking legitimate students',
      desc: 'The hard part: fraud deterrence that doesn\u2019t create new barriers for the students the Exchange was built to serve. A first-gen student enrolling at 11 PM from a shared family device looks similar to a fraudulent account.',
      today: 'Colleges set blunt rules: 50-mile enrollment radius, short drop-for-nonpayment deadlines. These deter some fraud but also block legitimate rural and working students who are exactly the population CVC exists to reach.',
      after: 'Risk scoring that weighs multiple signals: enrollment velocity, prior academic history, FA request timing, device fingerprint clustering. High-risk accounts get a human review hold \u2014 not an auto-reject. Legitimate students pass through. The analyst reviews edge cases.',
      toolLink: 'equity', toolName: 'Equity Scorer',
      complexity: 'long', complexityLabel: 'Long-term \u2014 requires cross-college behavioral data + careful equity auditing',
      signal: 'aic-equity'
    },
    {
      icon: '\u2699', title: 'Agentic AI for enrollment verification workflows',
      desc: 'An AI agent that autonomously verifies enrollment legitimacy within institutional policies \u2014 checking CCCID history, cross-referencing OpenCCC creation date with enrollment timing, and flagging anomalies \u2014 while keeping humans in the loop for final decisions.',
      today: 'Verification is manual and after-the-fact. FA offices discover fraud during reconciliation, sometimes months after disbursement. By then the revenue is gone and the staff hours are spent.',
      after: 'Agentic workflow: AI agent monitors new cross-enrollments in real time \u2192 checks CCCID age, enrollment history, FA request pattern \u2192 auto-approves low-risk (95% of enrollments) \u2192 queues medium-risk for analyst review \u2192 holds high-risk for FA office verification before disbursement. Humans decide. The agent surfaces.',
      toolLink: 'aiVision', toolName: 'AI Vision',
      complexity: 'long', complexityLabel: 'Long-term \u2014 requires real-time enrollment event stream + institutional policy engine',
      signal: 'aic-predict'
    },
    {
      icon: '\u26a0', title: 'Track the cost: lost revenue, staff effort, student trust',
      desc: 'Every fraudulent enrollment that reaches FA disbursement costs the system three ways: direct revenue loss, staff hours processing and reversing the award, and erosion of trust that makes colleges tighten policies \u2014 which hurts legitimate students.',
      today: 'Fraud impact is measured after the fact in aggregate \u2014 "we lost $X this year." No per-incident tracking. No connection between a specific fraudulent enrollment and the downstream staff effort or policy tightening it caused.',
      after: 'Per-incident fraud cost tracking: this CCCID generated $138 in FA disbursement + 2.5 hours of staff effort across 2 colleges + triggered a policy review. Aggregate dashboard shows fraud trends by college, term, and enrollment channel. The support analyst contributes data that shapes institutional response.',
      toolLink: 'correlator', toolName: 'Ticket-to-Barrier Correlator',
      complexity: 'medium', complexityLabel: 'Medium \u2014 needs FA reversal data linked to enrollment records',
      signal: 'aic-govern'
    }
  ],
  role: [
    {
      icon: '\u2191', title: '8:30 AM looks different',
      desc: 'The morning shift from "open the queue and start reading" to "open the dashboard and act on what\u2019s already been surfaced."',
      today: '<strong>8:30</strong> \u2014 Open ticket queue. 47 new tickets overnight. Start reading. By 9:15, realize 38 are from one college. Start investigating.<br><strong>10:00</strong> \u2014 Identify root cause (Ethos token). Draft campus communication.<br><strong>10:30</strong> \u2014 Begin documenting.',
      after: '<strong>8:30</strong> \u2014 Dashboard shows: 1 anomaly alert (Chabot, Ethos token, fired at 2:14 AM, 47 students affected). Pre-drafted campus email ready for review.<br><strong>8:45</strong> \u2014 Review and send. Begin documenting.<br><strong>9:00</strong> \u2014 Move to the <em>next</em> problem. 90 minutes saved.',
      toolLink: 'monitor', toolName: 'Monitor + Alerts',
      complexity: 'quick', complexityLabel: 'Quick win \u2014 alerting rules on existing monitoring data',
      signal: 'aic-role'
    },
    {
      icon: '\u2318', title: 'The analyst becomes the AI auditor',
      desc: 'If the Exchange recommends courses via AI, someone needs to check whether CCPG students are being steered toward fewer colleges. Whether part-time students are deprioritized. That\u2019s an analyst job \u2014 not an engineering job.',
      today: 'Course search results are sorted by quality badges and distance. No personalization. No one audits the sort order because it\u2019s deterministic.',
      after: 'AI-ranked results are personalized. The analyst runs a monthly equity report: "Are recommendations for CCPG students systematically different from non-CCPG students? Are rural students seeing fewer options?" Findings go into the next model iteration.',
      toolLink: 'equity', toolName: 'Equity Scorer',
      complexity: 'long', complexityLabel: 'Long-term \u2014 follows AI recommendation deployment',
      signal: 'aic-role'
    },
    {
      icon: '\u2194', title: 'AI handles pattern. The analyst handles the phone call.',
      desc: 'A classifier can sort 80% of tickets. It cannot call a registrar at 4:45 PM to negotiate a manual enrollment override for a student whose add deadline is tomorrow.',
      today: 'Analyst spends 60% of time on classification and triage, 40% on actual problem-solving, campus communication, and student follow-up.',
      after: 'AI handles classification and triage. Analyst spends 80% of time on the work that requires judgment: escalations, campus relationship management, edge cases, and the student on the phone who needs someone to own the problem end to end.',
      toolLink: 'comms', toolName: 'Communication',
      complexity: 'medium', complexityLabel: 'Medium \u2014 requires ticket auto-classification first',
      signal: 'aic-role'
    },
    {
      icon: '\u270e', title: 'Every resolution you write today is training data for tomorrow',
      desc: 'The quality of CVC\u2019s future AI will be directly proportional to the quality of documentation the support team produces now. Every KB article, every ticket tag, every escalation note is a labeled example.',
      today: 'KB articles are written for the next human analyst. Ticket tags are for reporting. Documentation quality varies.',
      after: 'KB articles are written for humans AND machines. Consistent tagging schema. Structured resolution notes. The analyst who documents well today is building the foundation that makes AI possible next year \u2014 and that makes their own job more focused on the work that matters.',
      toolLink: 'kb', toolName: 'Knowledge Base Builder',
      complexity: 'quick', complexityLabel: 'Quick win \u2014 start with documentation standards today',
      signal: 'aic-role'
    }
  ]
};
