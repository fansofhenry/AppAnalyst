// ═══════════════════════════════════════════════════════
// FLOW DIAGRAM — Architecture node interaction
// ═══════════════════════════════════════════════════════

var flowNodes = document.querySelectorAll('.f-node');

// Map each flow node to a Tracer stage id
var FLOW_TO_TRACER = ['home', 'exchange', 'teaching', 'canvas'];

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

  var tracerStage = FLOW_TO_TRACER[idx] || null;
  var jumpButton = tracerStage
    ? '<button class="fip-jump" onclick="flowJumpToTracer(\'' + tracerStage + '\')">' +
        '&rarr; Trace this layer in the diagnostic checklist' +
      '</button>'
    : '';

  p.innerHTML = '<div class="fip-title"><span class="fip-dot" style="background:' + d.dot + '"></span>' + d.title + '</div>' +
    '<div class="fip-text">' + d.text + '</div>' +
    '<div class="fip-tags">' + d.tags.map(function(t) { return '<span class="fip-tag">' + t + '</span>'; }).join('') + '</div>' +
    jumpButton;
  p.classList.add('show');
}

function flowJumpToTracer(stageId) {
  var tracer = document.getElementById('tracer');
  if (!tracer) return;
  // Make sure tracer is in "real" (checklist) view
  if (typeof rtSetView === 'function') rtSetView('real');
  tracer.scrollIntoView({ behavior: 'smooth' });
  setTimeout(function() {
    if (typeof rtSetActiveStage === 'function') rtSetActiveStage(stageId);
  }, 500);
}

// Auto-load architecture with initial selection
setTimeout(function() { showFlowInfo(1); }, 800);
