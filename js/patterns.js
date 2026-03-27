// ═══════════════════════════════════════════════════════
// PATTERN ANALYZER — Chart, legend, insights
// ═══════════════════════════════════════════════════════

// cats, catColors2, catNames, insights, chartData are globals from js/data/patterns.js
var hiddenCats = new Set();
var activeInsight = null;

function renderChart() {
  var cb = document.getElementById('chartBody');
  cb.innerHTML = '';
  var maxT = Math.max.apply(null, chartData.map(function(d) {
    return cats.filter(function(c) { return !hiddenCats.has(c); }).reduce(function(s, c) { return s + d[c]; }, 0);
  }));
  var cH = 180;
  var total = 0;
  chartData.forEach(function(d, idx) {
    var vis = cats.filter(function(c) { return !hiddenCats.has(c); });
    var t = vis.reduce(function(s, c) { return s + d[c]; }, 0);
    total += t;
    var bg = document.createElement('div');
    bg.className = 'bar-group';
    if (activeInsight !== null && insights[activeInsight].weeks.indexOf(idx) >= 0) bg.classList.add('highlighted');
    var tooltip = vis.map(function(c) { return '<span style="color:' + catColors2[c] + '">' + catNames[c] + ': ' + d[c] + '</span>'; }).join('<br>');
    var segs = '';
    ['other', 'data', 'sync', 'auth'].filter(function(c) { return !hiddenCats.has(c); }).forEach(function(c) {
      var h = maxT > 0 ? d[c] / maxT * cH : 0;
      segs += '<div class="bar-seg bar-seg-' + c + '" style="height:' + h + 'px"></div>';
    });
    bg.innerHTML = '<div class="bar-tooltip">' + tooltip + '<br><strong style="color:#fff">Total: ' + t + '</strong></div><div class="bar-total">' + t + '</div><div class="bar-stack">' + segs + '</div><div class="bar-label">' + d.label + '</div>';
    cb.appendChild(bg);
  });
  document.getElementById('chartTotal').textContent = total;
}

function renderLegend() {
  document.getElementById('chartLegend').innerHTML = cats.map(function(c) {
    return '<div class="legend-item' + (hiddenCats.has(c) ? ' disabled' : '') + '" onclick="toggleCat(\'' + c + '\')">' +
      '<div class="legend-dot" style="background:' + catColors2[c] + '"></div>' + catNames[c] + '</div>';
  }).join('');
}

function toggleCat(c) {
  if (hiddenCats.has(c)) hiddenCats.delete(c);
  else if (hiddenCats.size < cats.length - 1) hiddenCats.add(c);
  renderChart();
  renderLegend();
}

function renderInsights() {
  document.getElementById('insightsPanel').innerHTML = insights.map(function(ins, i) {
    var catColor = catColors2[ins.cat] || '#A1A1AA';
    var catName = catNames[ins.cat] || 'Other';
    var urgency = ins.severity === 'high' ? 'High Priority' : ins.severity === 'med' ? 'Trending' : 'Monitoring';
    return '<div class="insight-card' + (activeInsight === i ? ' insight-active' : '') + '" onclick="toggleInsight(' + i + ')" style="border-left:3px solid ' + catColor + '">' +
      '<div class="ic-severity" style="background:' + catColor + '15;color:' + catColor + '"><span class="ic-cat-dot" style="background:' + catColor + '"></span>' + catName + ' \u00b7 ' + urgency + '</div>' +
      '<div class="ic-title">' + ins.title + '</div>' +
      '<div class="ic-desc">' + ins.desc + '</div>' +
      '<div class="ic-meta">' + ins.meta.map(function(m) { return '<span>' + m + '</span>'; }).join('') + '</div>' +
      '<div class="ic-action">' + (activeInsight === i ? 'Highlighted in chart \u2713' : 'Click to highlight in chart \u2192') + '</div></div>';
  }).join('');
}

function toggleInsight(i) {
  activeInsight = activeInsight === i ? null : i;
  renderChart();
  renderInsights();
}

renderChart();
renderLegend();
renderInsights();

// Chart bar tooltips
document.querySelectorAll('.bar-group').forEach(function(group) {
  group.addEventListener('mouseenter', function(e) {
    var label = group.querySelector('.bar-label');
    var stack = group.querySelector('.bar-stack');
    if (!label || !stack) return;
    var total = 0;
    stack.querySelectorAll('div').forEach(function(d) { total += parseInt(d.style.height) || 0; });
    showTip(e, '<strong>' + label.textContent + '</strong>: ' + Math.round(total / 2.5) + ' tickets');
  });
  group.addEventListener('mouseleave', hideTip);
});
