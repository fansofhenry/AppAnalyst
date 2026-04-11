// ═══════════════════════════════════════════════════════
// NOTIFICATIONS — Browser notifications for ticket
// follow-ups that come due. Opt-in, never silent-install.
// Shows a permission-request button in the Today dashboard
// when permission is "default".
// ═══════════════════════════════════════════════════════

var NOTIF_SEEN_KEY = 'appanalyst.notif.seen.v1';

function notifSupport() {
  return typeof Notification !== 'undefined';
}

function notifPermission() {
  if (!notifSupport()) return 'unsupported';
  return Notification.permission;
}

function notifRequest() {
  if (!notifSupport()) { toast('Notifications not supported in this browser'); return; }
  if (Notification.permission === 'granted') { toast('Already enabled'); return; }
  if (Notification.permission === 'denied') {
    toast('Notifications blocked \u2014 change in browser settings');
    return;
  }
  Notification.requestPermission().then(function(perm) {
    if (perm === 'granted') {
      toast('Notifications enabled');
      notifRenderButton();
      notifCheck();
    } else {
      toast('Notifications not enabled');
    }
  });
}

function notifLoadSeen() {
  try { return JSON.parse(localStorage.getItem(NOTIF_SEEN_KEY) || '{}'); }
  catch (e) { return {}; }
}
function notifSaveSeen(s) { localStorage.setItem(NOTIF_SEEN_KEY, JSON.stringify(s)); }
function notifMarkSeen(ticketId, dateKey) {
  var seen = notifLoadSeen();
  seen[ticketId + '|' + dateKey] = true;
  notifSaveSeen(seen);
}
function notifWasSeen(ticketId, dateKey) {
  return !!notifLoadSeen()[ticketId + '|' + dateKey];
}

function notifCheck() {
  if (!notifSupport() || Notification.permission !== 'granted') return;
  var tickets = [];
  try { tickets = JSON.parse(localStorage.getItem('appanalyst.tickets.v1') || '[]'); } catch (e) { return; }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var todayKey = today.toISOString().slice(0, 10);

  tickets.forEach(function(t) {
    if (t.status === 'resolved') return;
    if (!t.followUp) return;
    var due = new Date(t.followUp + 'T00:00:00'); due.setHours(0, 0, 0, 0);
    if (isNaN(due.getTime())) return;
    var diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
    // Fire for overdue or due today — once per day per ticket
    if (diffDays <= 0 && !notifWasSeen(t.id, todayKey)) {
      try {
        var label = diffDays === 0 ? 'Follow up today' : 'Overdue ' + Math.abs(diffDays) + 'd';
        var n = new Notification(label + ': ' + (t.symptom || 'ticket'), {
          body: (t.college || 'No college') + ' · ' + (t.system || ''),
          tag: 'appanalyst-' + t.id,
          requireInteraction: false,
          silent: false
        });
        n.onclick = function() {
          window.focus();
          var tl = document.getElementById('ticketLog');
          if (tl) tl.scrollIntoView({ behavior: 'smooth' });
          setTimeout(function() {
            var r = document.querySelector('.tl-row[data-id="' + t.id + '"]');
            if (r) { r.classList.add('tl-expanded'); r.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          }, 500);
          n.close();
        };
        notifMarkSeen(t.id, todayKey);
      } catch (e) { /* ignore */ }
    }
  });
}

function notifRenderButton() {
  var wrap = document.querySelector('.today-head-actions');
  if (!wrap) return;
  var existing = document.getElementById('notifBtn');
  if (existing) existing.remove();
  if (!notifSupport()) return;
  var perm = notifPermission();
  if (perm === 'granted') return; // No button once enabled
  var btn = document.createElement('button');
  btn.id = 'notifBtn';
  btn.className = 'today-btn';
  btn.textContent = perm === 'denied' ? 'Notifications blocked' : 'Enable notifications';
  btn.title = perm === 'denied'
    ? 'Notifications are blocked — change in browser settings'
    : 'Get a browser notification when a follow-up comes due';
  btn.onclick = notifRequest;
  if (perm === 'denied') btn.disabled = true;
  wrap.appendChild(btn);
}

// Check on load, on focus, and every 15 minutes while the tab is open
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    notifRenderButton();
    notifCheck();
  });
} else {
  setTimeout(function() {
    notifRenderButton();
    notifCheck();
  }, 500);
}
window.addEventListener('focus', notifCheck);
setInterval(notifCheck, 15 * 60 * 1000);
