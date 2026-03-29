// ═══════════════════════════════════════════════════════
// ANIMATIONS — Count-ups, SVG background, ripples, bars
// ═══════════════════════════════════════════════════════

// Hero stat count-up on load — SINGLE VERSION (duplicate removed)
(function() {
  var stats = document.querySelectorAll('.h-stat-num');
  stats.forEach(function(el) {
    var raw = el.textContent.trim();
    var suffix = '';
    var target = 0;
    if (raw.indexOf('K') >= 0) {
      target = parseFloat(raw.replace(/,/g, '').replace('K', ''));
      suffix = 'K';
    } else if (raw.indexOf('%') >= 0) {
      target = parseFloat(raw.replace(/,/g, '').replace('%', ''));
      suffix = '%';
    } else {
      target = parseFloat(raw.replace(/,/g, ''));
    }
    if (isNaN(target) || target === 0) return;

    var duration = 1200;
    var start = performance.now();
    el.textContent = '0' + suffix;

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;

      if (suffix === 'K') {
        el.textContent = Math.round(current) + 'K';
      } else if (suffix === '%') {
        el.textContent = current >= 100 ? Math.round(current).toLocaleString() + '%' : Math.round(current) + '%';
      } else {
        el.textContent = Math.round(current);
      }
      if (progress < 1) requestAnimationFrame(tick);
      else {
        el.textContent = raw;
      }
    }
    setTimeout(function() { requestAnimationFrame(tick); }, 300);
  });
})();

// Hero stat count-up via data-count attributes (alternate approach)
(function() {
  var counted = false;
  var statEls = document.querySelectorAll('[data-count]');
  if (!statEls.length) return;

  function countUp(el) {
    var target = parseInt(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var useComma = el.dataset.comma === 'true';
    var duration = target <= 10 ? 600 : 1400;
    var start = performance.now();

    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      var display = useComma ? current.toLocaleString() : current.toString();
      el.textContent = display + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var heroObs = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      statEls.forEach(function(el, i) {
        setTimeout(function() { countUp(el); }, i * 150);
      });
    }
  }, { threshold: 0.3 });

  var statsContainer = document.querySelector('.h-stats');
  if (statsContainer) heroObs.observe(statsContainer);
})();

// Hero SVG network background
(function() {
  var header = document.querySelector('.header');
  if (!header) return;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'hero-bg');
  svg.setAttribute('viewBox', '0 0 600 400');
  var nodes = [
    { x: 120, y: 80 }, { x: 300, y: 60 }, { x: 480, y: 90 }, { x: 200, y: 200 },
    { x: 400, y: 180 }, { x: 100, y: 320 }, { x: 300, y: 300 }, { x: 500, y: 310 },
    { x: 150, y: 160 }, { x: 450, y: 260 }, { x: 250, y: 120 }, { x: 350, y: 340 }
  ];
  var connections = [[0, 1], [1, 2], [0, 3], [1, 4], [3, 5], [3, 6], [4, 7], [2, 4], [5, 6], [6, 7], [0, 8], [2, 9], [8, 3], [9, 7], [10, 1], [10, 4], [6, 11], [11, 7]];
  connections.forEach(function(c) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', nodes[c[0]].x); line.setAttribute('y1', nodes[c[0]].y);
    line.setAttribute('x2', nodes[c[1]].x); line.setAttribute('y2', nodes[c[1]].y);
    svg.appendChild(line);
  });
  nodes.forEach(function(n) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', n.x); circle.setAttribute('cy', n.y);
    circle.setAttribute('r', 3 + Math.random() * 4);
    svg.appendChild(circle);
  });
  header.insertBefore(svg, header.firstChild);
})();

// Click ripple on cards
(function() {
  document.addEventListener('click', function(e) {
    var card = e.target.closest && (
      e.target.closest('.b-card') || e.target.closest('.ai-card') ||
      e.target.closest('.counsel-card') || e.target.closest('.lookup-card') ||
      e.target.closest('.esc-card') || e.target.closest('.insight-card')
    );
    if (!card) return;
    var rect = card.getBoundingClientRect();
    var ripple = document.createElement('div');
    ripple.className = 'ripple';
    var size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    card.style.position = card.style.position || 'relative';
    card.style.overflow = 'hidden';
    card.appendChild(ripple);
    setTimeout(function() { ripple.remove(); }, 600);
  });
})();

// Growth bar scroll animation
var growthObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.growth-bar,.course-bar').forEach(function(bar) {
        setTimeout(function() { bar.classList.add('bar-visible'); }, 100);
      });
      growthObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
var growthSection = document.getElementById('cvcData');
if (growthSection) growthObs.observe(growthSection);

// Infographic bar animation
(function() {
  var growthBars = document.querySelectorAll('#growthChart .growth-bar');
  var courseBars = document.querySelectorAll('#courseChart .course-bar');
  var growthTargets = [];
  growthBars.forEach(function(bar) {
    growthTargets.push(bar.style.width);
    bar.style.width = '0%';
  });
  var courseTargets = [];
  courseBars.forEach(function(bar) {
    courseTargets.push(bar.style.width);
    bar.style.width = '0%';
  });

  var dataSection = document.getElementById('cvcData');
  if (!dataSection) return;

  var dataObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        growthBars.forEach(function(bar, i) {
          setTimeout(function() { bar.style.width = growthTargets[i]; }, i * 200);
        });
        courseBars.forEach(function(bar, i) {
          setTimeout(function() { bar.style.width = courseTargets[i]; }, 800 + i * 100);
        });
        dataObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  dataObs.observe(dataSection);
})();

// Exploration tracker
(function() {
  var explored = new Set();
  var tracker = document.createElement('div');
  tracker.className = 'explore-tracker';
  tracker.textContent = '0 of 11 explored';
  var dotsContainer = document.querySelector('.progress-dots');
  if (dotsContainer) {
    dotsContainer.appendChild(tracker);
  }

  var sectionIds = ['lookup', 'cvcData', 'flow', 'monitor', 'tracer', 'patterns', 'comms', 'outreach', 'aiVision', 'barrierOverview', 'originStory'];
  var exploreObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var wasNew = !explored.has(entry.target.id);
        explored.add(entry.target.id);
        if (wasNew && tracker) {
          tracker.textContent = explored.size + ' of 11 explored';
          tracker.classList.add('et-updated');
          setTimeout(function() { tracker.classList.remove('et-updated'); }, 800);
        }
      }
    });
  }, { threshold: 0.2 });

  sectionIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) exploreObs.observe(el);
  });
})();
