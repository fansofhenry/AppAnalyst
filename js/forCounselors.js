// ═══════════════════════════════════════════════════════
// FOR COUNSELORS — Triage workflows for the most common
// "a student came to me with..." situations involving the
// CVC Exchange. English + draft Spanish translation.
// ═══════════════════════════════════════════════════════

var COUNSELOR_LANG_KEY = 'appanalyst.counselor.lang.v1';

function counselorsGetLang() {
  try { return localStorage.getItem(COUNSELOR_LANG_KEY) || 'en'; }
  catch (e) { return 'en'; }
}
function counselorsSetLang(lang) {
  try { localStorage.setItem(COUNSELOR_LANG_KEY, lang); } catch (e) {}
  counselorsRender();
}

var COUNSELOR_SCENARIOS_ES = [
  {
    id: 'missing-course',
    category: 'Inscripci\u00f3n',
    trigger: 'Me inscrib\u00ed en una clase por CVC pero no est\u00e1 en mi Canvas',
    first: 'Pregunta cu\u00e1ndo se inscribieron. Si fue hace menos de 24 horas, tranquiliza \u2014 la sincronizaci\u00f3n toma tiempo. Si fue hace 24\u201372 horas, escala.',
    steps: [
      'Confirma que el estudiante se inscribi\u00f3 por cvc.edu, no directamente en el colegio que ensea',
      'Pregunta en qu\u00e9 colegio est\u00e1 el curso',
      'Revisa el SIS del colegio principal para el registro de inscripci\u00f3n del Exchange \u2014 debe aparecer como "CVC Exchange" o similar',
      'Si el registro est\u00e1 ah\u00ed, el problema est\u00e1 en el colegio que ensea / Canvas \u2014 contacta su A&R',
      'Si el registro NO est\u00e1 ah\u00ed, el problema est\u00e1 en la sincronizaci\u00f3n Exchange \u2192 SIS principal \u2014 escala a tu IT/Analista de Soporte'
    ],
    escalate: 'Analista de Soporte de Aplicaciones o ETS \u2192 si el patr\u00f3n afecta a m\u00faltiples estudiantes',
    say: 'Tu inscripci\u00f3n est\u00e1 segura. Esto es un problema de sincronizaci\u00f3n entre sistemas, no un problema con tu registro. Dejame revisar y te actualizar\u00e9 hoy.'
  },
  {
    id: 'fa-not-covering',
    category: 'Ayuda Financiera',
    trigger: 'Mi ayuda financiera no cubre mi curso de CVC',
    first: 'Pregunta si tienen un <strong>Acuerdo de Consorcio</strong> establecido. Si no, esa es toda la respuesta.',
    steps: [
      'Confirma que tienen un archivo de FA activo en tu colegio (principal) para este periodo',
      'Verifica si se ha iniciado un Acuerdo de Consorcio con el colegio que ensea para este curso espec\u00edfico',
      'Si no, el estudiante necesita visitar tu oficina de FA antes del deadline para agregar clases',
      'Si s\u00ed, verifica que el acuerdo fue aceptado y el calendario de desembolso incluye las unidades del Exchange'
    ],
    escalate: 'Director(a) de FA \u2192 si el Acuerdo de Consorcio es rechazado o demorado m\u00e1s all\u00e1 del deadline',
    say: 'La ayuda financiera para cursos del Exchange necesita un Acuerdo de Consorcio. Es una configuraci\u00f3n \u00fanica con Financial Aid \u2014 te acompa\u00f1o o les env\u00edo un correo. Necesitamos hacer esto antes del [deadline para agregar clases].'
  },
  {
    id: 'accommodation',
    category: 'DSPS',
    trigger: 'Tengo acomodaciones DSPS y las necesito en el colegio que ensea',
    first: 'Explica que las acomodaciones no se transfieren autom\u00e1ticamente. El estudiante necesita contactar DSPS del colegio que ensea directamente.',
    steps: [
      'Confirma que est\u00e1n activos con DSPS en tu colegio (principal)',
      'Obt\u00e9n la informaci\u00f3n de contacto de DSPS del colegio que ensea',
      'Ayuda al estudiante a redactar un correo a DSPS del colegio que ensea explicando: son estudiantes CVC Exchange de [tu colegio], tienen acomodaciones activas y quieren compartir su carta de acomodaciones',
      'Ofrece ayudarles a solicitar una copia de su carta de acomodaciones de tu oficina DSPS',
      'Rec\u00faerdales: contacta ANTES de que empiece el curso cuando sea posible'
    ],
    escalate: 'Tu Coordinador(a) DSPS \u2192 para iniciar contacto coordinador-a-coordinador si el estudiante no ha podido alcanzar DSPS del colegio que ensea',
    say: 'Tus acomodaciones son v\u00e1lidas y reconocidas, pero cada colegio las procesa a trav\u00e9s de su propia oficina DSPS. Conectemosle con DSPS del colegio que ensea hoy para que lo arreglen antes de que empiece tu clase.'
  },
  {
    id: 'dropped-wrong',
    category: 'Inscripci\u00f3n',
    trigger: 'Retir\u00e9 mi curso CVC pero todav\u00eda me est\u00e1n cobrando / todav\u00eda aparece',
    first: 'Pregunta C\u00d3MO lo retiraron. Debe ser a trav\u00e9s de cvc.edu, no del portal del colegio que ensea.',
    steps: [
      'Verifica que usaron la opci\u00f3n de retiro en cvc.edu, no el retiro directo del colegio que ensea',
      'Revisa el SIS del colegio principal para el registro de retiro',
      'Si el retiro no se registr\u00f3 por Exchange, el estudiante todav\u00eda est\u00e1 inscrito \u2014 necesitan retirarse por cvc.edu inmediatamente',
      'Si ya pas\u00f3 el deadline, las reglas de W (retiro) o reembolso parcial dependen del calendario del colegio que ensea',
      'Documenta la fecha/hora del intento original de retiro en caso de que necesiten apelar'
    ],
    escalate: 'Director(a) de A&R \u2192 si el retiro dentro del plazo fall\u00f3 y hay un reembolso en juego',
    say: 'Averigemos exactamente qu\u00e9 pas\u00f3. El retiro tiene que hacerse por cvc.edu para que ambos colegios reciban la notificaci\u00f3n. Mu\u00e9strame qu\u00e9 hiciste.'
  },
  {
    id: 'exchange-basics',
    category: 'Consejer\u00eda',
    trigger: 'Mi clase est\u00e1 llena en nuestro colegio \u2014 \u00bfpuedo tomarla en otro lado?',
    first: 'S\u00ed, y est\u00e1 dise\u00f1ado exactamente para esto. Gu\u00edalos por cvc.edu.',
    steps: [
      'Abran <a href="https://search.cvc.edu" target="_blank" rel="noopener">search.cvc.edu</a> juntos',
      'Busquen el curso espec\u00edfico \u2014 por ejemplo, "Math 1A"',
      'Revisen secciones abiertas en otros CCCs, comparando modalidad, fecha de inicio y horario',
      'Revisa ASSIST si est\u00e1n en plan de transferencia \u2014 confirma que el curso satisfar\u00e1 el requisito en el destino',
      'Gu\u00edalos por el flujo de inscripci\u00f3n para que sepan qu\u00e9 esperar',
      'Rec\u00faerdales sobre el Acuerdo de Consorcio de FA si usan ayuda, y coordinaci\u00f3n DSPS si aplica'
    ],
    escalate: 'T\u00edpicamente no se necesita a menos que el estudiante tenga requisitos de transferencia complejos',
    say: 'El CVC Exchange te permite inscribirte en clases en l\u00ednea en cualquier colegio comunitario de California \u2014 al instante, sin una solicitud separada. Encontremos tu curso juntos. Una cosa que debes saber: si usas ayuda financiera, necesitamos configurar un Acuerdo de Consorcio primero.'
  },
  {
    id: 'wrong-college',
    category: 'Identidad',
    trigger: 'El sistema cree que soy estudiante del colegio equivocado',
    first: 'Pregunta d\u00f3nde aplicaron primero. Su colegio principal se determina por el historial de OpenCCC.',
    steps: [
      'Confirma su cuenta OpenCCC (login de cccapply.org)',
      'Revisa qu\u00e9 colegio(s) aparecen en su historial de solicitudes OpenCCC',
      'Si han aplicado a m\u00faltiples colegios, pueden necesitar seleccionar el colegio principal correcto al iniciar sesi\u00f3n en Exchange',
      'Si el colegio equivocado est\u00e1 designado, contacta A&R del colegio correcto para verificar su inscripci\u00f3n y actualizar los registros de OpenCCC'
    ],
    escalate: 'Tu A&R o el help desk de IT para un remapeo de identidad',
    say: 'Tu colegio principal se determina por d\u00f3nde est\u00e1s activamente inscrito. Veamos tus solicitudes y aseguremos que el Exchange est\u00e1 apuntando al correcto.'
  }
];

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

  var lang = counselorsGetLang();
  var scenarios = lang === 'es' ? COUNSELOR_SCENARIOS_ES : COUNSELOR_SCENARIOS;
  var firstLabel = lang === 'es' ? 'Primero:' : 'First thing:';
  var sayLabel = lang === 'es' ? 'Qu\u00e9 decir' : 'What to say';
  var stepsLabel = lang === 'es' ? 'Pasos' : 'Steps';
  var escLabel = lang === 'es' ? 'Escalar a:' : 'Escalate to:';
  var quickTitle = lang === 'es' ? 'Referencia r\u00e1pida \u2014 siempre seguro decir' : 'Quick reference — always safe to say';
  var quickItems = lang === 'es'
    ? [
        '<strong>La inscripci\u00f3n del estudiante es v\u00e1lida.</strong> Los retrasos de sincronizaci\u00f3n no significan que no est\u00e1n inscritos.',
        '<strong>Su colegio principal es su base.</strong> La ayuda financiera, transcripciones, cuotas y la mayor\u00eda de los bloqueos viven ah\u00ed, no en el colegio que ensea.',
        '<strong>Los retiros van por cvc.edu</strong>, no por el portal del colegio que ensea. Este es el error de retiro #1.',
        '<strong>Las acomodaciones DSPS no se transfieren autom\u00e1ticamente.</strong> Los estudiantes deben contactar DSPS del colegio que ensea por separado.',
        '<strong>La ayuda financiera necesita un Acuerdo de Consorcio.</strong> Configurarlo en el colegio principal ANTES del deadline de agregar clases.',
        '<strong>Cuando tengas dudas, abre un ticket con tu Analista de Soporte.</strong> Ellos pueden rastrear el problema a trav\u00e9s de los sistemas de maneras que no puedes desde el front desk.'
      ]
    : [
        '<strong>The student\u2019s enrollment is valid.</strong> Sync delays don\u2019t mean they\u2019re not enrolled.',
        '<strong>Their home college is their base.</strong> Financial aid, transcripts, fees, and most holds live there, not at the teaching college.',
        '<strong>Drops go through cvc.edu</strong>, not the teaching college\u2019s portal. This is the #1 drop mistake.',
        '<strong>DSPS accommodations don\u2019t auto-transfer.</strong> Students must contact the teaching college DSPS separately.',
        '<strong>Financial aid needs a Consortium Agreement.</strong> Set it up at the home college BEFORE the add deadline.',
        '<strong>When in doubt, open a ticket with your App Support Analyst.</strong> They can trace the issue across systems in ways you can\u2019t from the front desk.'
      ];

  // Language toggle
  var langToggle =
    '<div class="stu-lang-wrap" style="margin-bottom:1.25rem">' +
      '<button class="stu-lang-btn' + (lang === 'en' ? ' stu-lang-active' : '') + '" onclick="counselorsSetLang(\'en\')">English</button>' +
      '<button class="stu-lang-btn' + (lang === 'es' ? ' stu-lang-active' : '') + '" onclick="counselorsSetLang(\'es\')">Espa\u00f1ol</button>' +
      (lang === 'es' ? '<span class="stu-lang-note">Draft translation &mdash; please flag any errors</span>' : '') +
    '</div>';

  var categories = {};
  scenarios.forEach(function(s) {
    if (!categories[s.category]) categories[s.category] = [];
    categories[s.category].push(s);
  });

  var html = langToggle + '<div class="cnl-grid">';
  Object.keys(categories).forEach(function(cat) {
    html += '<div class="cnl-group"><div class="cnl-group-title">' + cat + '</div>';
    categories[cat].forEach(function(s) {
      html += '<div class="cnl-card" onclick="this.classList.toggle(\'cnl-expanded\')">' +
        '<div class="cnl-trigger">' +
          '<span class="cnl-quote">&ldquo;</span>' +
          '<span class="cnl-trigger-text">' + s.trigger + '</span>' +
        '</div>' +
        '<div class="cnl-detail">' +
          '<div class="cnl-first"><span class="cnl-label">' + firstLabel + '</span> ' + s.first + '</div>' +
          '<div class="cnl-say-box">' +
            '<div class="cnl-label">' + sayLabel + '</div>' +
            '<div class="cnl-say">&ldquo;' + s.say + '&rdquo;</div>' +
          '</div>' +
          '<div class="cnl-steps-box">' +
            '<div class="cnl-label">' + stepsLabel + '</div>' +
            '<ol class="cnl-steps">' +
              s.steps.map(function(step) { return '<li>' + step + '</li>'; }).join('') +
            '</ol>' +
          '</div>' +
          '<div class="cnl-escalate"><span class="cnl-label">' + escLabel + '</span> ' + s.escalate + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  });
  html += '</div>';

  // Quick reference card
  html += '<div class="cnl-quickref">' +
    '<h3>' + quickTitle + '</h3>' +
    '<ul>' +
      quickItems.map(function(item) { return '<li>' + item + '</li>'; }).join('') +
    '</ul>' +
  '</div>';

  container.innerHTML = html;
}

window.addEventListener('appanalyst:role-change', counselorsRender);
counselorsRender();
