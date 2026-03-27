// ═══════════════════════════════════════════════════════
// FLOW DIAGRAM — Architecture node interaction
// ═══════════════════════════════════════════════════════

var flowNodes = document.querySelectorAll('.f-node');

// MERGED: original showFlowInfo + fn-active class wrapper
function showFlowInfo(idx) {
  var d = flowData[idx];
  var p = document.getElementById('flowInfo');

  // Active node styling (from wrapper)
  flowNodes.forEach(function(n) { n.classList.remove('fn-active'); });
  if (flowNodes[idx]) flowNodes[idx].classList.add('fn-active');

  // Original active-node class
  document.querySelectorAll('.f-node').forEach(function(n, i) {
    n.classList.toggle('active-node', i === idx);
  });

  p.innerHTML = '<div class="fip-title"><span class="fip-dot" style="background:' + d.dot + '"></span>' + d.title + '</div>' +
    '<div class="fip-text">' + d.text + '</div>' +
    '<div class="fip-tags">' + d.tags.map(function(t) { return '<span class="fip-tag">' + t + '</span>'; }).join('') + '</div>';
  p.classList.add('show');
}

// Auto-load architecture with initial selection
setTimeout(function() { showFlowInfo(1); }, 800);
