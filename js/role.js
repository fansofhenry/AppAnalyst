// ═══════════════════════════════════════════════════════
// ROLE SELECTOR — Choose your role so sections, onboarding,
// and greetings can be tailored. Persists to localStorage.
// Emits an appanalyst:role-change event on switches so
// dependent modules can re-render.
// ═══════════════════════════════════════════════════════

var ROLE_KEY = 'appanalyst.role.v1';

var ROLES = [
  {
    id: 'analyst',
    label: 'Application Support Analyst',
    short: 'Analyst',
    icon: '\u2318',
    color: 'var(--primary)',
    greeting: 'your workbench',
    desc: 'Diagnose, resolve, document, escalate. Owner of the support queue.'
  },
  {
    id: 'ar',
    label: 'A&R Specialist',
    short: 'A&R',
    icon: '\u25C6',
    color: 'var(--blue)',
    greeting: 'your admissions desk',
    desc: 'Receive and reconcile Exchange enrollment records in the home SIS.'
  },
  {
    id: 'fa',
    label: 'Financial Aid Officer',
    short: 'FA',
    icon: '$',
    color: 'var(--amber)',
    greeting: 'your financial aid view',
    desc: 'Handle Consortium Agreements, CCPG transfers, and FA disbursement for Exchange students.'
  },
  {
    id: 'counselor',
    label: 'Counselor',
    short: 'Counselor',
    icon: '\u25C9',
    color: 'var(--purple)',
    greeting: 'your counseling workspace',
    desc: 'Advise students on using the Exchange and triage when things go wrong.'
  },
  {
    id: 'dsps',
    label: 'DSPS Coordinator',
    short: 'DSPS',
    icon: '\u2605',
    color: 'var(--teal)',
    greeting: 'your accessibility workspace',
    desc: 'Coordinate accommodations across colleges for Exchange students.'
  },
  {
    id: 'student',
    label: 'Student',
    short: 'Student',
    icon: '\u2641',
    color: '#0EA5E9',
    greeting: 'your Exchange guide',
    desc: 'Use this self-help guide to find and enroll in courses at other colleges.'
  },
  {
    id: 'manager',
    label: 'Manager / Team Lead',
    short: 'Lead',
    icon: '\u25BE',
    color: '#CA8A04',
    greeting: 'your leadership view',
    desc: 'Weekly rollups, resolution trends, college hotspots, and team metrics surfaced for 1:1s and reporting.'
  }
];

function roleGet() {
  try { return localStorage.getItem(ROLE_KEY) || 'analyst'; }
  catch (e) { return 'analyst'; }
}

function roleSet(id) {
  try { localStorage.setItem(ROLE_KEY, id); } catch (e) {}
  document.documentElement.setAttribute('data-role', id);
  window.dispatchEvent(new CustomEvent('appanalyst:role-change', { detail: { role: id } }));
  roleRenderButton();
  roleCloseMenu();
  roleApplyBodyClass();

  // Re-render dependent views
  if (typeof todayRender === 'function') todayRender();
  if (typeof obRender === 'function') obRender();
  if (typeof studentsRender === 'function') studentsRender();
  if (typeof counselorsRender === 'function') counselorsRender();

  var meta = ROLES.find(function(r) { return r.id === id; });
  if (meta) toast('Switched to ' + meta.label);
}

function roleMeta(id) {
  return ROLES.find(function(r) { return r.id === (id || roleGet()); }) || ROLES[0];
}

function roleApplyBodyClass() {
  document.body.classList.remove('role-analyst', 'role-ar', 'role-fa', 'role-counselor', 'role-dsps', 'role-student', 'role-manager');
  document.body.classList.add('role-' + roleGet());
}

function roleRenderButton() {
  var btn = document.getElementById('roleToggle');
  if (!btn) return;
  var meta = roleMeta();
  btn.innerHTML =
    '<span class="role-icon" style="background:' + meta.color + '">' + meta.icon + '</span>' +
    '<span class="role-label">' + meta.short + '</span>' +
    '<span class="role-caret">\u25BE</span>';
  btn.setAttribute('title', 'Viewing as ' + meta.label + ' — click to change');
}

function roleToggleMenu() {
  var menu = document.getElementById('roleMenu');
  if (!menu) return;
  menu.classList.toggle('role-menu-open');
  if (menu.classList.contains('role-menu-open')) {
    roleRenderMenu();
    setTimeout(function() {
      document.addEventListener('click', roleOutsideClick);
    }, 10);
  }
}

function roleCloseMenu() {
  var menu = document.getElementById('roleMenu');
  if (menu) menu.classList.remove('role-menu-open');
  document.removeEventListener('click', roleOutsideClick);
}

function roleOutsideClick(e) {
  if (e.target.closest('.role-picker-wrap')) return;
  roleCloseMenu();
}

function roleRenderMenu() {
  var menu = document.getElementById('roleMenu');
  if (!menu) return;
  var current = roleGet();
  menu.innerHTML = ROLES.map(function(r) {
    var active = r.id === current;
    return '<button class="role-option' + (active ? ' role-option-active' : '') + '" onclick="roleSet(\'' + r.id + '\')">' +
      '<span class="role-option-icon" style="background:' + r.color + '">' + r.icon + '</span>' +
      '<span class="role-option-main">' +
        '<span class="role-option-label">' + r.label + '</span>' +
        '<span class="role-option-desc">' + r.desc + '</span>' +
      '</span>' +
      (active ? '<span class="role-option-check">\u2713</span>' : '') +
    '</button>';
  }).join('') +
  '<div class="role-share">' +
    '<div class="role-share-label">Share this view</div>' +
    '<div class="role-share-desc">Copy a link that opens this site in ' + roleMeta().short + ' mode for anyone you send it to.</div>' +
    '<div style="display:flex;gap:.4rem;flex-wrap:wrap">' +
      '<button class="tl-btn" onclick="routerCopyShareLink(\'' + current + '\')">Copy share link</button>' +
      '<button class="tl-btn" onclick="qrefPrintCurrent()">Print quick-ref card</button>' +
    '</div>' +
  '</div>';
}

// Apply on load
document.documentElement.setAttribute('data-role', roleGet());
if (document.body) roleApplyBodyClass();
else document.addEventListener('DOMContentLoaded', roleApplyBodyClass);
roleRenderButton();
