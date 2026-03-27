// ═══════════════════════════════════════════════════════
// NAV — Links, TOC, progress dots, scroll progress
// ═══════════════════════════════════════════════════════

// Nav link click handlers with smooth scroll
document.querySelectorAll('.nav-links a').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      var target = document.getElementById(href.substring(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// Nav active tracking
var navSecs = {};
document.querySelectorAll('.nav-links a').forEach(function(a) {
  var h = a.getAttribute('href');
  if (h && h.startsWith('#')) { navSecs[h.substring(1)] = a; }
});
var navObs2 = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    var link = navSecs[entry.target.id];
    if (link && entry.isIntersecting) {
      Object.values(navSecs).forEach(function(l) { l.classList.remove('nav-active'); });
      link.classList.add('nav-active');
    }
  });
}, { threshold: .15, rootMargin: '-56px 0px -50% 0px' });
Object.keys(navSecs).forEach(function(id) {
  var el = document.getElementById(id);
  if (el) navObs2.observe(el);
});

// Table of Contents
var tocJustOpened = false;

function toggleToc() {
  var panel = document.getElementById('tocPanel');
  var btn = document.getElementById('tocBtn');
  if (!panel) return;
  var isOpen = panel.classList.contains('toc-visible');
  if (isOpen) {
    panel.classList.remove('toc-visible');
    if (btn) btn.classList.remove('toc-open');
  } else {
    panel.classList.add('toc-visible');
    if (btn) btn.classList.add('toc-open');
    tocJustOpened = true;
  }
}

function tocGo(sectionId) {
  var el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function() {
      var panel = document.getElementById('tocPanel');
      var btn = document.getElementById('tocBtn');
      if (panel) panel.classList.remove('toc-visible');
      if (btn) btn.classList.remove('toc-open');
    }, 400);
  }
}

// Close TOC when clicking outside
document.addEventListener('click', function(e) {
  if (tocJustOpened) { tocJustOpened = false; return; }
  var panel = document.getElementById('tocPanel');
  var btn = document.getElementById('tocBtn');
  if (!panel || !btn) return;
  if (panel.classList.contains('toc-visible') && !panel.contains(e.target) && !btn.contains(e.target)) {
    panel.classList.remove('toc-visible');
    btn.classList.remove('toc-open');
  }
});

// TOC filter (Stripe-style)
function filterToc(query) {
  var q = query.trim().toLowerCase();
  document.querySelectorAll('.toc-item').forEach(function(item) {
    var title = item.querySelector('.toc-item-title');
    var desc = item.querySelector('.toc-item-desc');
    var text = (title ? title.textContent : '') + ' ' + (desc ? desc.textContent : '');
    if (!q || text.toLowerCase().indexOf(q) >= 0) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
  document.querySelectorAll('.toc-group').forEach(function(group) {
    var hasVisible = false;
    group.querySelectorAll('.toc-item').forEach(function(item) {
      if (item.style.display !== 'none') hasVisible = true;
    });
    group.style.display = hasVisible ? 'block' : 'none';
  });
}

// TOC active tracking
var tocSectionIds = ['lookup', 'cvcData', 'flow', 'monitor', 'tracer', 'patterns', 'comms', 'outreach', 'aiVision', 'barrierOverview'];
var tocItems = document.querySelectorAll('.toc-item');
var tocObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      var idx = tocSectionIds.indexOf(entry.target.id);
      if (idx >= 0) {
        tocItems.forEach(function(item) { item.classList.remove('toc-current'); });
        if (tocItems[idx]) tocItems[idx].classList.add('toc-current');
      }
    }
  });
}, { threshold: 0.15, rootMargin: '-56px 0px -60% 0px' });
tocSectionIds.forEach(function(id) {
  var el = document.getElementById(id);
  if (el) tocObserver.observe(el);
});

// Back to top
var backBtn = document.getElementById('backToTop');
if (backBtn) {
  var scrollEl = document.scrollingElement || document.documentElement;
  function checkBackBtn() {
    var scrollPos = window.pageYOffset || scrollEl.scrollTop || 0;
    if (scrollPos > 400) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', checkBackBtn, { passive: true });
  document.addEventListener('scroll', checkBackBtn, { passive: true });
  setInterval(checkBackBtn, 1000);
  checkBackBtn();
}

// Progress dots
var dotSections = ['lookup', 'cvcData', 'flow', 'monitor', 'tracer', 'patterns', 'comms', 'outreach', 'aiVision', 'barriers'];
var dotEls = document.querySelectorAll('.progress-dot');
var dotObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      var idx = dotSections.indexOf(entry.target.id);
      if (idx >= 0) {
        dotEls.forEach(function(d) { d.classList.remove('pd-active'); });
        if (dotEls[idx]) dotEls[idx].classList.add('pd-active');
      }
    }
  });
}, { threshold: 0.2, rootMargin: '-56px 0px -50% 0px' });
dotSections.forEach(function(id) {
  var el = document.getElementById(id);
  if (el) dotObserver.observe(el);
});

// Nav visited dots
(function() {
  var visited = new Set();
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var linkMap = {};
  navLinks.forEach(function(a) {
    var id = a.getAttribute('href').replace('#', '');
    if (id) linkMap[id] = a;
  });
  var visitObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting && !visited.has(e.target.id)) {
        visited.add(e.target.id);
        var link = linkMap[e.target.id];
        if (link && !link.classList.contains('nav-visited')) {
          link.classList.add('nav-visited');
        }
      }
    });
  }, { threshold: .3 });
  Object.keys(linkMap).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) visitObs.observe(el);
  });
})();

// Scroll progress bar
(function() {
  var bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', function() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

// Section flash on nav click
document.querySelectorAll('.nav-links a, .toc-item').forEach(function(link) {
  link.addEventListener('click', function() {
    var href = link.getAttribute('href') || '';
    var targetId = href.startsWith('#') ? href.substring(1) : link.getAttribute('onclick');
    if (targetId && targetId.indexOf("'") > 0) {
      targetId = targetId.split("'")[1];
    }
    if (targetId) {
      var target = document.getElementById(targetId);
      if (target) {
        target.classList.add('sec-arrived');
        setTimeout(function() { target.classList.remove('sec-arrived'); }, 800);
      }
    }
  });
});
