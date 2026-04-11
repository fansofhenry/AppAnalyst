// ═══════════════════════════════════════════════════════
// NAV BADGE — Open ticket count pill on the Status nav link.
// Updates on load, focus, and via navBadgeUpdate() calls from
// other modules (e.g., tlSave, rtPromoteToTicket).
// ═══════════════════════════════════════════════════════

function navBadgeUpdate() {
  var tickets = [];
  var aging = 0;
  var urgent = 0;
  try {
    tickets = JSON.parse(localStorage.getItem('appanalyst.tickets.v1') || '[]');
  } catch (e) { return; }

  var open = tickets.filter(function(t) { return t.status !== 'resolved'; });
  open.forEach(function(t) {
    var days = (Date.now() - new Date(t.created).getTime()) / 86400000;
    if (days >= 7) urgent++;
    else if (days >= 3) aging++;
  });

  var link = document.querySelector('.nav-links a[href="#monitor"]');
  if (!link) return;

  var badge = link.querySelector('.nav-count-badge');
  if (open.length === 0) {
    if (badge) badge.remove();
    return;
  }

  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'nav-count-badge';
    link.appendChild(badge);
  }
  badge.textContent = open.length;
  badge.classList.toggle('nav-badge-urgent', urgent > 0);
  badge.classList.toggle('nav-badge-aging', urgent === 0 && aging > 0);
  badge.title = open.length + ' open' + (urgent ? ' (' + urgent + ' urgent)' : aging ? ' (' + aging + ' aging)' : '');
}

navBadgeUpdate();
window.addEventListener('focus', navBadgeUpdate);

// Listen for storage events (if a backup restore happens, etc.)
window.addEventListener('storage', function(e) {
  if (e.key === 'appanalyst.tickets.v1') navBadgeUpdate();
});
