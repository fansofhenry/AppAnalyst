// ═══════════════════════════════════════════════════════
// FOR A&R / FA / DSPS — Role-specific workflow sections
// mirroring the Counselor pattern. Each section has
// scenario cards grouped by category. EN + draft ES.
// ═══════════════════════════════════════════════════════

var ROLES_LANG_KEY = 'appanalyst.roles.lang.v1';

function rolesGetLang() {
  try { return localStorage.getItem(ROLES_LANG_KEY) || 'en'; }
  catch (e) { return 'en'; }
}
function rolesSetLang(lang) {
  try { localStorage.setItem(ROLES_LANG_KEY, lang); } catch (e) {}
  forARRender(); forFARender(); forDSPSRender();
}

var AR_SCENARIOS_ES = [
  {
    category: 'Registros de inscripci\u00f3n entrantes',
    trigger: 'Lleg\u00f3 una inscripci\u00f3n del Exchange pero el estudiante no est\u00e1 en nuestro SIS',
    first: 'Revisa si tu SIS aplica los registros del Exchange en tiempo real, por lotes, o manual. Los niveles Banner Ethos y Colleague Ethos son m\u00e1s propensos a esto.',
    steps: [
      'Busca al estudiante por CCCID en tu SIS para confirmar cualquier registro previo',
      'Revisa el Exchange Admin Dashboard para el registro autoritativo y su estado',
      'Si tu colegio est\u00e1 en Banner/Colleague Ethos: la inscripci\u00f3n probablemente necesita registro manual hoy',
      'Si est\u00e1 en Banner Direct / PeopleSoft: la inscripci\u00f3n deber\u00eda haberse registrado autom\u00e1ticamente \u2014 escala a IT',
      'Registra manualmente si es necesario y marca el ticket para que tu Analista de Soporte rastree el patr\u00f3n'
    ],
    escalate: 'Tu equipo ETS / IT \u2192 si la brecha es repetida o afecta m\u00e1s de un estudiante',
    say: 'El Exchange tiene el registro. Nuestro SIS solo necesita un registro manual por la configuraci\u00f3n de nuestra integraci\u00f3n. Lo manejar\u00e9 hoy.'
  },
  {
    category: 'Registros de inscripci\u00f3n entrantes',
    trigger: 'Un estudiante aparece en nuestro listado con bandera "CVC Exchange" pero no reconozco el curso',
    first: 'Esa bandera significa que el estudiante est\u00e1 inscrito en nuestro colegio a trav\u00e9s del Exchange como su colegio que ensea. Confirma que esto es intencional.',
    steps: [
      'Busca el c\u00f3digo/secci\u00f3n del curso en tu horario \u2014 confirma que existe y est\u00e1 disponible para estudiantes del Exchange',
      'Revisa el colegio principal del estudiante (mostrado en el registro) para verificar que est\u00e1n leg\u00edtimamente inscritos ah\u00ed',
      'Confirma que el Acuerdo de Consorcio est\u00e1 en archivo si hay ayuda financiera involucrada',
      'No se necesita acci\u00f3n a menos que haya una discrepancia \u2014 esta es una inscripci\u00f3n normal del Exchange'
    ],
    escalate: 'T\u00edpicamente no se necesita',
    say: 'Este es un estudiante de [colegio principal] tomando nuestro curso a trav\u00e9s del CVC Exchange. Su colegio principal maneja su ayuda y registros; nosotros solo ensea\u0301amos el curso.'
  },
  {
    category: 'Reconciliaci\u00f3n',
    trigger: 'Nuestra reconciliaci\u00f3n mensual muestra que Exchange y SIS no coinciden',
    first: 'Usa el Reconciliation Helper en esta herramienta o exporta ambos listados a CSV y comp\u00e1ralos.',
    steps: [
      'Exporta el listado del Exchange Admin Dashboard para el periodo + Exporta tu listado del SIS filtrado por "CVC Exchange"',
      'Pega ambos en el Reconciliation Helper (&rarr; Secci\u00f3n \u21C4 Reconcile)',
      'Investiga cada discrepancia marcada individualmente \u2014 faltante, unidades incorrectas, periodo incorrecto',
      'Registra correcciones manualmente en SIS o escala al proveedor si el patr\u00f3n sugiere un problema de integraci\u00f3n',
      'Documenta el n\u00famero de brechas por periodo en una entrada KB para tu gerente'
    ],
    escalate: 'Tu equipo de IT si >5% de los registros no coinciden',
    say: 'Tenemos una brecha de reconciliaci\u00f3n de N registros este mes. La mayor\u00eda son retrasos de registro manual, no p\u00e9rdida de datos. Aqu\u00ed est\u00e1 la lista.'
  },
  {
    category: 'Identidad',
    trigger: 'Dos estudiantes tienen el mismo nombre y no estoy seguro cu\u00e1l es del Exchange',
    first: 'El CCCID es el identificador autoritativo. Nunca conf\u00edes solo en el nombre.',
    steps: [
      'Obt\u00e9n el CCCID del registro del Exchange Admin Dashboard',
      'Busca en SIS por CCCID, no por nombre o fecha de nacimiento',
      'Si tu SIS almacena el CCCID como ID alternativo, usa ese campo para la b\u00fasqueda',
      'Si no, considera pedirle a IT que agregue el almacenamiento de CCCID como solicitud permanente'
    ],
    escalate: 'Tu equipo de IT para problemas de mapeo de identidad',
    say: 'El CCCID es el identificador \u00fanico en el que nos basamos para los estudiantes del Exchange. Dejame obtenerlo y busc\u00e1rtelos.'
  }
];

var FA_SCENARIOS_ES = [
  {
    category: 'Acuerdos de Consorcio',
    trigger: 'Un estudiante quiere ayuda financiera para un curso en otro CCC por el Exchange',
    first: 'Necesitan un Acuerdo de Consorcio en archivo ANTES del deadline para agregar clases. Empieza hoy.',
    steps: [
      'Confirma que el estudiante tiene un archivo de FA activo en tu (principal) colegio para este periodo',
      'Verifica el conteo de unidades y cr\u00e9ditos del curso del Exchange \u2014 \u00bfse agregar\u00e1n al c\u00e1lculo de carga de FA?',
      'Redacta el Acuerdo de Consorcio con el colegio que ensea (usa tu formulario est\u00e1ndar)',
      'Obt\u00e9n la firma del estudiante, env\u00eda al FA del colegio que ensea, archiva una copia',
      'Actualiza la carga de FA del estudiante y vuelve a ejecutar los c\u00e1lculos de Pell/CCPG',
      'Confirma que el calendario de desembolso refleja las unidades del Exchange'
    ],
    escalate: 'Director(a) de FA \u2192 si el acuerdo es rechazado o demorado m\u00e1s all\u00e1 del deadline',
    say: 'Absolutamente podemos usar tu ayuda financiera para este curso. Requiere un acuerdo \u00fanico entre nuestras dos oficinas de FA. Lo empezar\u00e9 hoy \u2014 lo necesitamos en archivo para [fecha l\u00edmite].'
  },
  {
    category: 'CCPG / exenciones',
    trigger: 'La exenci\u00f3n CCPG del estudiante no se transfiri\u00f3 al curso del Exchange',
    first: 'CCPG se otorga en el colegio principal y deber\u00eda aplicarse. Si no lo hizo, puede que el Acuerdo de Consorcio no se haya configurado.',
    steps: [
      'Confirma la elegibilidad CCPG activa en tu colegio principal para este periodo',
      'Revisa si existe un Acuerdo de Consorcio para este curso espec\u00edfico del Exchange',
      'Si no hay acuerdo: config\u00faralo inmediatamente (ver flujo de arriba)',
      'Si el acuerdo existe: contacta al FA del colegio que ensea y pideles aplicar la exenci\u00f3n basada en el acuerdo',
      'Si ya pas\u00f3 el deadline y el estudiante pag\u00f3 de su bolsillo, investiga opciones de reembolso'
    ],
    escalate: 'Director(a) de FA para procesamiento de reembolso',
    say: 'Tu exenci\u00f3n de cuota es v\u00e1lida. No se aplic\u00f3 autom\u00e1ticamente por c\u00f3mo fluyen los cursos del Exchange entre colegios. Dejame asegurarme de que tu Acuerdo de Consorcio est\u00e9 configurado correctamente para que esto se resuelva hoy.'
  },
  {
    category: 'Desembolso',
    trigger: 'El desembolso de Pell se ejecut\u00f3 pero el estudiante dice que falta',
    first: 'Causa probable: las unidades del curso del Exchange no se incluyeron en el c\u00e1lculo de carga al momento del desembolso.',
    steps: [
      'Revisa la carga de inscripci\u00f3n del estudiante TAL COMO SE CALCUL\u00d3 en la \u00faltima ejecuci\u00f3n de desembolso',
      'Compara con la carga actual incluyendo las unidades del Exchange',
      'Verifica que el Acuerdo de Consorcio fue archivado y las unidades reportadas a tu sistema de FA a tiempo',
      'Si la diferencia es real, presenta una solicitud de desembolso suplementario',
      'Documenta la brecha de tiempo para futuros periodos \u2014 patr\u00f3n com\u00fan en el census'
    ],
    escalate: 'Director(a) de FA para desembolsos suplementarios',
    say: 'Las unidades de tu curso del Exchange fueron agregadas a tu carga, pero despu\u00e9s de que se ejecut\u00f3 el \u00faltimo desembolso. Procesaremos un desembolso suplementario para cubrir la diferencia.'
  },
  {
    category: 'R2T4',
    trigger: 'Estudiante se retir\u00f3 de un curso del Exchange a mitad de periodo; las reglas R2T4 no son claras',
    first: 'R2T4 es calculado por el colegio principal basado en el total de unidades inscritas (incluyendo Exchange).',
    steps: [
      'Obt\u00e9n la fecha de retiro del registro del Exchange o del colegio que ensea',
      'Recalcula el total de unidades inscritas despu\u00e9s del retiro',
      'Ejecuta R2T4 en tu colegio principal usando el nuevo conteo de unidades',
      'Si hay ayuda que devolver, proc\u00e9sala por tu flujo est\u00e1ndar de R2T4',
      'Coordina con el colegio que ensea sobre cualquier responsabilidad de cuota restante'
    ],
    escalate: 'Director(a) de FA para preguntas de R2T4',
    say: 'Porque este fue un curso del Exchange, R2T4 se calcula en nuestro lado \u2014 tu colegio principal \u2014 usando el conteo reducido total de unidades. Dejame guiarte por c\u00f3mo se ve eso.'
  }
];

var DSPS_SCENARIOS_ES = [
  {
    category: 'Acomodaciones entre colegios',
    trigger: 'Estudiante del Exchange necesita sus acomodaciones en el colegio que ensea',
    first: 'Las acomodaciones no se transfieren autom\u00e1ticamente. Conecta al estudiante con DSPS del colegio que ensea inmediatamente.',
    steps: [
      'Confirma que el estudiante est\u00e1 activo con DSPS en tu colegio (principal)',
      'Prepara una copia de su carta de acomodaciones \u2014 el estudiante debe consentir compartir',
      'Ayuda al estudiante a enviar un correo a DSPS del colegio que ensea: presentarse, decir que son estudiantes CVC Exchange de [colegio principal], solicitar configuraci\u00f3n de acomodaciones',
      'Opcionalmente inicia contacto coordinador-a-coordinador si el estudiante no ha podido alcanzar DSPS del colegio que ensea',
      'Haz seguimiento con el estudiante despu\u00e9s de 48 horas para confirmar que el colegio que ensea responde'
    ],
    escalate: 'Tu Coordinador(a) DSPS si el colegio que ensea no responde en 48 horas',
    say: 'Tus acomodaciones son v\u00e1lidas. Cada colegio las maneja a trav\u00e9s de su propia oficina DSPS, as\u00ed que necesitamos involucrar al colegio que ensea hoy. As\u00ed es c\u00f3mo lo haremos juntos.'
  },
  {
    category: 'Formatos alternativos',
    trigger: 'Estudiante necesita materiales en formato alternativo para un curso del Exchange',
    first: 'La responsabilidad del formato alternativo recae en el colegio que ensea el curso.',
    steps: [
      'El estudiante contacta DSPS del colegio que ensea para materiales alternativos',
      'Si el colegio que ensea dice que no o es lento, escala coordinador-a-coordinador',
      'DSPS del colegio principal puede proporcionar apoyo general (entrenamiento de tecnolog\u00eda asistiva, estrategias) pero el formato alternativo pertenece al colegio que ensea',
      'Documenta la cronolog\u00eda en caso de que haya una pregunta sobre acceso equitativo'
    ],
    escalate: 'Coordinador-a-coordinador, luego cumplimiento 504 / ADA si no se resuelve',
    say: 'Los materiales en formato alternativo para cursos del Exchange vienen del colegio que ensea el curso. Aseguremonos de que su oficina DSPS sepa lo que necesitas, y te respaldo si hay alg\u00fan retraso.'
  },
  {
    category: 'Acomodaciones de examen',
    trigger: 'Estudiante del Exchange necesita tiempo extendido para un examen de Canvas en el colegio que ensea',
    first: 'La configuraci\u00f3n de Canvas vive en el colegio que ensea. El instructor debe agregar la extensi\u00f3n de tiempo.',
    steps: [
      'Estudiante contacta DSPS del colegio que ensea con su carta de acomodaciones',
      'DSPS del colegio que ensea notifica al instructor',
      'El instructor establece la extensi\u00f3n de tiempo en el examen en Canvas en el colegio que ensea',
      'DSPS del colegio principal puede ayudar con la abogac\u00eda si hay retraso, pero no tiene acceso a Canvas del colegio que ensea'
    ],
    escalate: 'DSPS del colegio que ensea \u2192 instructor \u2192 decano de divisi\u00f3n si no responde',
    say: 'Tu acomodaci\u00f3n de tiempo extendido aplica aqu\u00ed \u2014 la oficina DSPS del colegio que ensea necesita notificar a tu instructor para que lo establezca en Canvas. Contact\u00e9moslos ahora mismo.'
  },
  {
    category: 'Coordinaci\u00f3n DSPS-Exchange',
    trigger: 'Construyendo un flujo de coordinaci\u00f3n regular con oficinas DSPS de colegios socios',
    first: 'Al inicio de cada periodo, contacta proactivamente a DSPS en tus 5-10 colegios socios de mayor volumen.',
    steps: [
      'Mant\u00e9n una lista de contactos de coordinadores DSPS en tus colegios socios principales (usa las notas de Directorio)',
      'Env\u00eda un correo de inicio de periodo "hola, con qui\u00e9n trabajamos" a cada uno',
      'Comparte tu formato est\u00e1ndar de carta de acomodaciones y proceso preferido',
      'Pideles que compartan los suyos',
      'Registra las actividades de coordinaci\u00f3n como eventos de outreach en el Outreach Planner de este workbench'
    ],
    escalate: 'T\u00edpicamente no se necesita \u2014 esto es proactivo',
    say: 'No es un escenario de cara al estudiante, pero vale la pena construirlo como h\u00e1bito cada periodo.'
  }
];

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
  var lang = rolesGetLang();
  var firstLabel = lang === 'es' ? 'Primero:' : 'First thing:';
  var sayLabel = lang === 'es' ? 'Qu\u00e9 decir' : 'What to say';
  var stepsLabel = lang === 'es' ? 'Pasos' : 'Steps';
  var escLabel = lang === 'es' ? 'Escalar a:' : 'Escalate to:';

  var categories = {};
  scenarios.forEach(function(s) {
    if (!categories[s.category]) categories[s.category] = [];
    categories[s.category].push(s);
  });

  var langToggle = '<div class="stu-lang-wrap" style="margin-bottom:1.25rem">' +
    '<button class="stu-lang-btn' + (lang === 'en' ? ' stu-lang-active' : '') + '" onclick="rolesSetLang(\'en\')">English</button>' +
    '<button class="stu-lang-btn' + (lang === 'es' ? ' stu-lang-active' : '') + '" onclick="rolesSetLang(\'es\')">Espa\u00f1ol</button>' +
    (lang === 'es' ? '<span class="stu-lang-note">Draft translation &mdash; please flag any errors</span>' : '') +
  '</div>';

  var html = langToggle + '<div class="cnl-grid">';
  Object.keys(categories).forEach(function(cat) {
    html += '<div class="cnl-group"><div class="cnl-group-title" style="color:' + accentColor + ';border-color:' + accentColor + '">' + cat + '</div>';
    categories[cat].forEach(function(s) {
      html += '<div class="cnl-card" onclick="this.classList.toggle(\'cnl-expanded\')">' +
        '<div class="cnl-trigger">' +
          '<span class="cnl-quote" style="color:' + accentColor + '">&ldquo;</span>' +
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
  return html;
}

function forARRender() {
  var body = document.getElementById('forARBody');
  if (!body) return;
  var data = rolesGetLang() === 'es' ? AR_SCENARIOS_ES : AR_SCENARIOS;
  body.innerHTML = forRolesRenderScenarios(data, 'var(--blue)');
}

function forFARender() {
  var body = document.getElementById('forFABody');
  if (!body) return;
  var data = rolesGetLang() === 'es' ? FA_SCENARIOS_ES : FA_SCENARIOS;
  body.innerHTML = forRolesRenderScenarios(data, 'var(--amber)');
}

function forDSPSRender() {
  var body = document.getElementById('forDSPSBody');
  if (!body) return;
  var data = rolesGetLang() === 'es' ? DSPS_SCENARIOS_ES : DSPS_SCENARIOS;
  body.innerHTML = forRolesRenderScenarios(data, 'var(--teal)');
}

window.addEventListener('appanalyst:role-change', function() {
  forARRender();
  forFARender();
  forDSPSRender();
});

forARRender();
forFARender();
forDSPSRender();
