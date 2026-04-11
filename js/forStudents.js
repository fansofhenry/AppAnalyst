// ═══════════════════════════════════════════════════════
// FOR STUDENTS — Plain-language self-help guide to using
// the CVC Exchange. English + draft Spanish translation.
// The Spanish is a first draft; a native speaker should
// review it before it goes out to students.
// ═══════════════════════════════════════════════════════

var STUDENT_LANG_KEY = 'appanalyst.student.lang.v1';

function studentsGetLang() {
  try { return localStorage.getItem(STUDENT_LANG_KEY) || 'en'; }
  catch (e) { return 'en'; }
}
function studentsSetLang(lang) {
  try { localStorage.setItem(STUDENT_LANG_KEY, lang); } catch (e) {}
  studentsRender();
}

var STUDENT_CONTENT_ES = {
  stepsTitle: 'Gu\u00eda en 5 pasos',
  steps: [
    {
      n: 1,
      title: 'Aseg\u00farate de estar inscrito(a) en tu colegio principal',
      body: 'Necesitas un expediente estudiantil activo en un colegio comunitario de California antes de poder usar el CVC Exchange. Este es tu <strong>colegio principal</strong> &mdash; donde pagas matr\u00edcula, solicitas ayuda financiera, y recibes tu t\u00edtulo. Si a\u00fan no has solicitado admisi\u00f3n, empieza en <a href="https://www.cccapply.org" target="_blank" rel="noopener">cccapply.org</a>.',
      check: 'Tengo un n\u00famero de estudiante activo en mi colegio principal'
    },
    {
      n: 2,
      title: 'Busca tu clase en cvc.edu',
      body: 'Ve a <a href="https://search.cvc.edu" target="_blank" rel="noopener">search.cvc.edu</a>. Escribe la clase que necesitas (por ejemplo "Math 1A") o navega por materia. Los resultados te muestran cada colegio comunitario de California que ofrece esa clase en l\u00ednea este semestre, con los cupos disponibles.',
      check: 'Encontr\u00e9 una secci\u00f3n que quiero tomar en otro colegio'
    },
    {
      n: 3,
      title: 'Haz clic en "Inscribirse" e inicia sesi\u00f3n con tu cuenta OpenCCC',
      body: 'Cuando encuentres una secci\u00f3n, haz clic en el bot\u00f3n Inscribirse. Iniciar\u00e1s sesi\u00f3n con tu <strong>cuenta OpenCCC</strong> &mdash; la misma que usaste para CCCApply. Si te pide elegir tu colegio principal, selecciona el colegio donde ya est\u00e1s inscrito(a).',
      check: 'Inici\u00e9 sesi\u00f3n y seleccion\u00e9 mi colegio principal'
    },
    {
      n: 4,
      title: 'Confirma tu inscripci\u00f3n y espera la sincronizaci\u00f3n',
      body: 'Una vez que env\u00edes, el Exchange manda tu inscripci\u00f3n tanto a tu colegio principal como al colegio que ensea el curso. Esto puede tardar desde unos minutos hasta algunas horas, dependiendo de los sistemas involucrados. Recibir\u00e1s un correo de confirmaci\u00f3n.',
      check: 'Recib\u00ed un correo de confirmaci\u00f3n'
    },
    {
      n: 5,
      title: 'Accede al curso en Canvas',
      body: 'Despu\u00e9s de que se complete la sincronizaci\u00f3n, el curso aparece en tu <strong>panel de Canvas</strong>. Inicia sesi\u00f3n en el sitio de Canvas del colegio que ensea (por ejemplo, <code>canvas.foothill.edu</code>) con tus credenciales de OpenCCC o con el SSO de tu colegio, seg\u00fan el caso. El curso aparecer\u00e1 en tu lista.',
      check: 'El curso est\u00e1 en mi Canvas'
    }
  ],
  troublesTitle: 'Soluci\u00f3n de problemas \u2014 situaciones comunes',
  troubles: [
    {
      symptom: 'Mi clase no aparece en Canvas',
      causes: 'La informaci\u00f3n de la inscripci\u00f3n a\u00fan no ha terminado de sincronizarse, o hay un retraso entre los sistemas de los colegios.',
      action: 'Espera 24 horas. Si todav\u00eda no aparece, contacta la oficina de <strong>Admissions & Records</strong> en tu colegio principal (no el que ensea) y pide que verifiquen tu registro de inscripci\u00f3n en el Exchange.'
    },
    {
      symptom: 'Recib\u00ed un error cuando intent\u00e9 inscribirme',
      causes: 'Errores comunes: no has completado la orientaci\u00f3n en tu colegio principal, tienes un bloqueo de inscripci\u00f3n, la clase requiere un prerrequisito que no has cumplido, o la secci\u00f3n est\u00e1 llena.',
      action: 'Revisa el portal de tu colegio principal para ver si tienes alg\u00fan bloqueo. Si no hay nada, env\u00eda un correo a la oficina de Counseling de tu colegio principal con una captura de pantalla del error.'
    },
    {
      symptom: 'Mi ayuda financiera no cubre el curso del Exchange',
      causes: 'Tu colegio principal necesita configurar un <strong>Acuerdo de Consorcio (Consortium Agreement)</strong> para que tu ayuda se aplique a cursos tomados en otros colegios a trav\u00e9s del Exchange.',
      action: 'Contacta la oficina de Financial Aid en tu colegio principal y preg\u00fanta sobre un Acuerdo de Consorcio para tu curso del Exchange. Esto debe configurarse antes de la fecha l\u00edmite para agregar clases.'
    },
    {
      symptom: 'Necesito una acomodaci\u00f3n (DSPS) en el colegio que ensea',
      causes: 'Las acomodaciones no se transfieren autom\u00e1ticamente entre colegios. Tienes que registrarte con DSPS en el colegio que ensea.',
      action: 'Env\u00eda un correo o llama a la oficina DSPS del colegio que ensea tan pronto como te inscribas. Diles que eres estudiante del CVC Exchange de [tu colegio principal] y pregunta c\u00f3mo compartir tu carta de acomodaciones.'
    },
    {
      symptom: 'Quiero retirarme del curso del Exchange',
      causes: 'Retirarse debe hacerse a trav\u00e9s del Exchange, no del proceso normal del colegio que ensea.',
      action: 'Regresa a <a href="https://cvc.edu" target="_blank" rel="noopener">cvc.edu</a>, inicia sesi\u00f3n, encuentra el curso en tu panel, y usa la opci\u00f3n de retiro ah\u00ed. Presta atenci\u00f3n a las fechas l\u00edmite \u2014 siguen el calendario del colegio que ensea.'
    },
    {
      symptom: 'No puedo iniciar sesi\u00f3n con mi cuenta OpenCCC',
      causes: 'Tu contrase\u00f1a de OpenCCC podr\u00eda necesitar un reinicio, o la integraci\u00f3n de inicio de sesi\u00f3n de tu colegio principal podr\u00eda estar temporalmente ca\u00edda.',
      action: 'Primero intenta la <a href="https://www.opencccapply.net" target="_blank" rel="noopener">recuperaci\u00f3n de contrase\u00f1a</a> en OpenCCC. Si eso no funciona, contacta la mesa de ayuda de IT de tu colegio principal.'
    }
  ],
  contactsTitle: 'A qui\u00e9n contactar en cada colegio',
  contacts: [
    { role: 'Admissions & Records', body: 'Para registros de inscripci\u00f3n, transcripciones, bloqueos de registraci\u00f3n, y preguntas sobre cursos retirados. <strong>Empieza con tu colegio principal</strong> para cualquier asunto de inscripci\u00f3n o transcripci\u00f3n.' },
    { role: 'Financial Aid', body: 'Para FAFSA, CCPG (exenci\u00f3n de cuotas), Acuerdos de Consorcio, y desembolso. <strong>Solo tu colegio principal</strong> maneja tu ayuda financiera.' },
    { role: 'Counseling', body: 'Para planeaci\u00f3n de cursos, preguntas sobre transferencia, y ayuda navegando el Exchange. Trabaja estrechamente con tu colegio principal.' },
    { role: 'DSPS', body: 'Para acomodaciones, formatos alternativos, y apoyo de accesibilidad. Contacta <strong>ambos</strong> colegios principales y los que ensean.' },
    { role: 'Instructor', body: 'Para preguntas sobre contenido del curso, tareas, y Canvas. <strong>Contacta al instructor en el colegio que ensea</strong> para preguntas espec\u00edficas del curso.' }
  ]
};

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

  var lang = studentsGetLang();
  var steps = lang === 'es' ? STUDENT_CONTENT_ES.steps : STUDENT_STEPS;
  var troubles = lang === 'es' ? STUDENT_CONTENT_ES.troubles : STUDENT_TROUBLES;
  var contacts = lang === 'es' ? STUDENT_CONTENT_ES.contacts : null;
  var troublesTitle = lang === 'es' ? STUDENT_CONTENT_ES.troublesTitle : 'Troubleshooting \u2014 common problems';
  var contactsTitle = lang === 'es' ? STUDENT_CONTENT_ES.contactsTitle : 'Who to contact at each college';

  var langToggle =
    '<div class="stu-lang-wrap">' +
      '<button class="stu-lang-btn' + (lang === 'en' ? ' stu-lang-active' : '') + '" onclick="studentsSetLang(\'en\')">English</button>' +
      '<button class="stu-lang-btn' + (lang === 'es' ? ' stu-lang-active' : '') + '" onclick="studentsSetLang(\'es\')">Espa\u00f1ol</button>' +
      (lang === 'es' ? '<span class="stu-lang-note">Draft translation &mdash; please flag any errors</span>' : '') +
    '</div>';

  var stepsHtml = '<div class="stu-steps">' +
    steps.map(function(s) {
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
    '<h3 class="stu-troubles-title">' + troublesTitle + '</h3>' +
    troubles.map(function(t) {
      var causeLabel = lang === 'es' ? 'Causa probable' : 'Likely cause';
      var actionLabel = lang === 'es' ? 'Qu\u00e9 hacer' : 'What to do';
      return '<div class="stu-trouble">' +
        '<div class="stu-trouble-symptom">' + t.symptom + '</div>' +
        '<div class="stu-trouble-row"><span class="stu-trouble-label">' + causeLabel + '</span><span>' + t.causes + '</span></div>' +
        '<div class="stu-trouble-row stu-trouble-action"><span class="stu-trouble-label">' + actionLabel + '</span><span>' + t.action + '</span></div>' +
      '</div>';
    }).join('') +
  '</div>';

  var contactsHtml;
  if (contacts) {
    contactsHtml =
      '<div class="stu-contacts">' +
        '<h3 class="stu-contacts-title">' + contactsTitle + '</h3>' +
        '<div class="stu-contact-grid">' +
          contacts.map(function(c) {
            return '<div class="stu-contact-card"><div class="stu-contact-role">' + c.role + '</div><div class="stu-contact-body">' + c.body + '</div></div>';
          }).join('') +
        '</div>' +
      '</div>';
  } else {
    contactsHtml =
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
  }

  container.innerHTML = langToggle + stepsHtml + troublesHtml + contactsHtml;
}

window.addEventListener('appanalyst:role-change', studentsRender);
studentsRender();
