// ═══════════════════════════════════════════════════════
// FHDA DISTRICT AWARENESS
// Marks Foothill + De Anza as "home" across all tools
// ═══════════════════════════════════════════════════════

var HOME_COLLEGES = ['Foothill College', 'De Anza College'];

// 1. Add "HOME" badge to Foothill/De Anza in Monitor status rows
function markHomeRows() {
  document.querySelectorAll('.s-name').forEach(function(el) {
    if (HOME_COLLEGES.indexOf(el.textContent.trim()) >= 0 && !el.querySelector('.home-badge')) {
      var badge = document.createElement('span');
      badge.className = 'home-badge';
      badge.textContent = 'FHDA';
      badge.setAttribute('title', 'Foothill\u2013De Anza CCD \u2014 your district');
      el.appendChild(badge);
      // Mark the row
      var row = el.closest('.status-row');
      if (row) row.classList.add('home-row');
    }
  });
}

// 2. Add FHDA District Health banner above monitor grid
function addFHDAHealth() {
  var monGrid = document.getElementById('monitorGrid');
  if (!monGrid || document.getElementById('fhdaHealth')) return;
  // Check Foothill + De Anza status
  var fhStatus = 'ok', daStatus = 'ok';
  for (var i = 0; i < allColleges.length; i++) {
    if (allColleges[i].name === 'Foothill College') fhStatus = allColleges[i].status;
    if (allColleges[i].name === 'De Anza College') daStatus = allColleges[i].status;
  }
  var allOk = fhStatus === 'ok' && daStatus === 'ok';
  var div = document.createElement('div');
  div.id = 'fhdaHealth';
  div.className = 'fhda-health';
  div.innerHTML =
    '<span class="fhda-health-dot" style="background:' + (allOk ? 'var(--primary)' : 'var(--amber)') + '"></span>' +
    '<span><strong>FHDA District</strong> \u2014 Foothill ' + (fhStatus === 'ok' ? '\u2713' : '\u26a0') + ' &middot; De Anza ' + (daStatus === 'ok' ? '\u2713' : '\u26a0') + '</span>' +
    '<span class="fhda-health-label">' + (allOk ? 'All systems healthy' : 'Attention needed') + '</span>';
  monGrid.parentElement.insertBefore(div, monGrid);
}

// 3. Mark home colleges in Lookup results
function markHomeLookups() {
  document.querySelectorAll('.lookup-college-name').forEach(function(el) {
    if (HOME_COLLEGES.indexOf(el.textContent.trim()) >= 0) {
      var card = el.closest('.lookup-card');
      if (card && !card.classList.contains('home-card')) {
        card.classList.add('home-card');
        if (!el.querySelector('.home-badge')) {
          var badge = document.createElement('span');
          badge.className = 'home-badge';
          badge.textContent = 'FHDA';
          el.appendChild(badge);
        }
      }
    }
  });
}

// 4. Sort FHDA colleges first in lookup results
function sortFHDAFirst(colleges) {
  if (colleges && colleges.sort) {
    var fhda = ['Foothill College', 'De Anza College'];
    colleges.sort(function(a, b) {
      var aHome = fhda.indexOf(a.name) >= 0 ? 0 : 1;
      var bHome = fhda.indexOf(b.name) >= 0 ? 0 : 1;
      if (aHome !== bHome) return aHome - bHome;
      return a.name.localeCompare(b.name);
    });
  }
  return colleges;
}

// 5. Footer cleanup — remove old generic disclaimer text
(function() {
  var oldDisclaimer = document.querySelector('footer div[style*="font-size:.7rem"]');
  if (oldDisclaimer) oldDisclaimer.remove();
})();

// 6. Search hint — suggests "Try: Foothill" after idle
(function() {
  var input = document.getElementById('collegeLookup');
  if (!input) return;
  var wrap = input.closest('.lookup-input-wrap');
  if (!wrap) return;
  var hint = document.createElement('div');
  hint.className = 'lookup-hint';
  hint.innerHTML = 'Try: <strong style="color:var(--primary)">Foothill</strong> or <strong style="color:var(--primary)">De Anza</strong>';
  wrap.appendChild(hint);
  var timer = setTimeout(function() {
    if (!input.value) hint.classList.add('hint-visible');
  }, 2500);
  input.addEventListener('focus', function() {
    clearTimeout(timer);
    hint.classList.remove('hint-visible');
  });
  input.addEventListener('input', function() {
    hint.classList.remove('hint-visible');
  });
})();

// 7. Nav brand — add FHDA subtitle
(function() {
  var title = document.querySelector('.nav-title');
  if (!title || title.querySelector('.nav-title-sub')) return;
  var sub = document.createElement('span');
  sub.className = 'nav-title-sub';
  sub.textContent = 'Foothill\u2013De Anza CCD';
  title.appendChild(sub);
})();

// Initial run of FHDA markers (delayed to allow DOM to settle)
setTimeout(function() {
  markHomeRows();
  addFHDAHealth();
  markHomeLookups();
}, 300);
