// ═══════════════════════════════════════════════════════
// INLINE TOOLTIPS — Wrap known CVC acronyms with
// hover-tooltips pulling from the glossary. Progressive
// enhancement: runs after each section render.
// ═══════════════════════════════════════════════════════

var TOOLTIP_TERMS = null;

function tooltipsBuildIndex() {
  if (TOOLTIP_TERMS !== null) return TOOLTIP_TERMS;
  TOOLTIP_TERMS = {};
  if (typeof GLOSSARY_TERMS === 'undefined') return TOOLTIP_TERMS;
  GLOSSARY_TERMS.forEach(function(t) {
    // Only tooltip terms that are likely to appear as acronyms or short phrases
    if (t.term.length <= 25) {
      TOOLTIP_TERMS[t.term] = t;
    }
  });
  return TOOLTIP_TERMS;
}

function tooltipsEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Walk text nodes inside a container and wrap matching terms
function tooltipsEnhance(containerSelector) {
  var terms = tooltipsBuildIndex();
  var termList = Object.keys(terms);
  if (termList.length === 0) return;

  // Build a single regex: \b(AER|CCCID|...)\b
  // Escape special chars
  var escaped = termList.map(function(t) {
    return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  // Longer terms first so "Consortium Agreement" matches before "Consortium"
  escaped.sort(function(a, b) { return b.length - a.length; });
  var pattern = new RegExp('\\b(' + escaped.join('|') + ')\\b', 'g');

  var containers = document.querySelectorAll(containerSelector);
  containers.forEach(function(container) {
    // Walk only text nodes; skip anything already inside a tooltip / link / code
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        var p = node.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        // Skip inside anchors, code, inputs, existing tooltips
        var skip = { A: 1, CODE: 1, PRE: 1, INPUT: 1, TEXTAREA: 1, SELECT: 1, BUTTON: 1, KBD: 1 };
        var el = p;
        while (el && el !== container) {
          if (skip[el.tagName]) return NodeFilter.FILTER_REJECT;
          if (el.classList && el.classList.contains('gloss-tooltip-wrap')) return NodeFilter.FILTER_REJECT;
          el = el.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(function(node) {
      var text = node.nodeValue;
      if (!pattern.test(text)) return;
      pattern.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var last = 0;
      var m;
      while ((m = pattern.exec(text)) !== null) {
        if (m.index > last) {
          frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        }
        var term = terms[m[1]];
        var wrap = document.createElement('span');
        wrap.className = 'gloss-tooltip-wrap';
        wrap.setAttribute('tabindex', '0');
        wrap.textContent = m[1];
        var bubble = document.createElement('span');
        bubble.className = 'gloss-tooltip-bubble';
        bubble.innerHTML = '<strong>' + tooltipsEsc(term.term) + '</strong> &middot; ' + tooltipsEsc(term.long) + '<br><span class="gloss-tooltip-body">' + tooltipsEsc(term.body.slice(0, 220)) + (term.body.length > 220 ? '\u2026' : '') + '</span>';
        wrap.appendChild(bubble);
        frag.appendChild(wrap);
        last = m.index + m[1].length;
      }
      if (last < text.length) {
        frag.appendChild(document.createTextNode(text.slice(last)));
      }
      node.parentNode.replaceChild(frag, node);
    });
  });
}

// Enhance the role workflow sections after any re-render
function tooltipsEnhanceAll() {
  tooltipsEnhance('#forCounselorsBody');
  tooltipsEnhance('#forARBody');
  tooltipsEnhance('#forFABody');
  tooltipsEnhance('#forDSPSBody');
  tooltipsEnhance('#forStudentsBody');
}

// Initial run + re-run on role change (which re-renders those sections)
setTimeout(tooltipsEnhanceAll, 300);
window.addEventListener('appanalyst:role-change', function() {
  setTimeout(tooltipsEnhanceAll, 50);
});
