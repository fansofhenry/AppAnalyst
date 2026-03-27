// ═══════════════════════════════════════════════════════
// COMMS — Copy message text, escalation card interaction
// ═══════════════════════════════════════════════════════

// Copy message text — SINGLE VERSION (merged, duplicate removed)
function copyMsgText(btn) {
  var preview = btn.closest('.msg-preview');
  if (!preview) return;
  var parts = [];
  // Grab audience
  var to = preview.querySelector('.msg-to');
  if (to) parts.push('To: ' + to.textContent);
  // Grab subject line (div containing "Subject:")
  var divs = preview.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    if (divs[i].textContent.indexOf('Subject:') === 0) {
      parts.push(divs[i].textContent);
      break;
    }
  }
  // Grab body
  var body = preview.querySelector('.msg-body');
  if (body) parts.push('\n' + (body.innerText || body.textContent));
  var text = parts.join('\n');
  navigator.clipboard.writeText(text.trim()).then(function() {
    btn.textContent = '\u2713 Copied';
    btn.style.background = 'var(--primary)';
    btn.style.color = '#fff';
    btn.style.borderColor = 'var(--primary)';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = 'Copy';
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.classList.remove('copied');
    }, 1500);
  }).catch(function() {
    toast('Copy failed');
  });
}

// Escalation card interaction
document.querySelectorAll('.esc-card').forEach(function(card) {
  card.addEventListener('click', function() {
    document.querySelectorAll('.esc-card').forEach(function(c) { c.classList.remove('esc-active'); });
    card.classList.add('esc-active');
  });
});
