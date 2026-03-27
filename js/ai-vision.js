// ═══════════════════════════════════════════════════════
// AI VISION TOOL — Tab switching and card rendering
// ═══════════════════════════════════════════════════════

var activeAiView = 'fraud';

function setAiView(view, el) {
  activeAiView = view;
  document.querySelectorAll('.ai-tab').forEach(function(t) { t.classList.remove('active'); });
  if (el) {
    el.classList.add('active');
  } else {
    document.querySelectorAll('.ai-tab').forEach(function(t) {
      if (t.textContent.toLowerCase().indexOf(view) >= 0 || (view === 'fraud' && t.textContent.indexOf('Fraud') >= 0)) t.classList.add('active');
    });
  }
  renderAiView();
}

function renderAiView() {
  var cards = aiData[activeAiView];
  var el = document.getElementById('aiBody');
  if (!cards || !el) return;

  var cxClass = { quick: 'cx-quick', medium: 'cx-medium', long: 'cx-long' };

  var html = cards.map(function(card, idx) {
    var expand = '<div class="ai-card-expand">' +
      '<div class="ai-compare">' +
      '<div class="ai-compare-col ai-today"><div class="ai-compare-label">Today</div>' + card.today + '</div>' +
      '<div class="ai-compare-col ai-after"><div class="ai-compare-label">With AI</div>' + card.after + '</div>' +
      '</div>' +
      '<div class="ai-meta">' +
      '<a class="ai-tool-link" onclick="event.stopPropagation();document.getElementById(\'' + card.toolLink + '\').scrollIntoView({behavior:\'smooth\'})">\u2192 ' + card.toolName + '</a>' +
      '<span class="ai-complexity ' + (cxClass[card.complexity] || '') + '">' + card.complexityLabel + '</span>' +
      '</div>' +
      '</div>';

    return '<div class="ai-card" onclick="this.classList.toggle(\'ai-expanded\')">' +
      '<div class="ai-card-icon">' + card.icon + '</div>' +
      '<div class="ai-card-title">' + card.title + '</div>' +
      '<div class="ai-card-desc">' + card.desc + '</div>' +
      expand +
      '</div>';
  }).join('');

  el.innerHTML = '<div class="ai-card-grid">' + html + '</div>';
}

renderAiView();
