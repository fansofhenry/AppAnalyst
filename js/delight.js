// ═══════════════════════════════════════════════════════
// DELIGHT.JS — Joy & discovery layer (game-dev inspired)
// Juice · Discovery · Personality · Zero barrier
// ═══════════════════════════════════════════════════════

(function() {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 768;

  // ═══ FEATURE 1: CONFETTI PARTICLE SYSTEM ═══
  // Real DOM confetti — colored squares/circles with gravity + drift

  function confettiBurst(count, originX, originY) {
    if (reducedMotion) return;
    var n = isMobile ? Math.floor(count / 2) : count;
    var colors = ['#0F766E','#14B8A6','#22C55E','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#EC4899'];
    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;overflow:hidden';
    document.body.appendChild(container);

    for (var i = 0; i < n; i++) {
      var p = document.createElement('div');
      p.className = 'confetti-particle';
      var size = 6 + Math.random() * 6;
      var color = colors[Math.floor(Math.random() * colors.length)];
      var isCircle = Math.random() > 0.5;
      var x = (originX || window.innerWidth / 2) + (Math.random() - 0.5) * 200;
      var drift = (Math.random() - 0.5) * 300;
      var delay = Math.random() * 0.3;
      var duration = 1.5 + Math.random() * 1.5;
      p.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'background:' + color + ';' +
        'border-radius:' + (isCircle ? '50%' : '2px') + ';' +
        'left:' + x + 'px;top:' + (originY || window.innerHeight * 0.3) + 'px;' +
        '--drift:' + drift + 'px;' +
        'animation-delay:' + delay + 's;' +
        'animation-duration:' + duration + 's;';
      container.appendChild(p);
    }

    setTimeout(function() { container.remove(); }, 3500);
  }

  function confettiBurstCenter(count) {
    confettiBurst(count || 35, window.innerWidth / 2, window.innerHeight * 0.3);
  }

  // Expose globally for hooks in app.js / keyboard.js
  window.confettiBurst = confettiBurst;
  window.confettiBurstCenter = confettiBurstCenter;


  // ═══ FEATURE 2: ACHIEVEMENT DISCOVERY TOASTS ═══
  // 7 pleasant-surprise moments — tracked in sessionStorage

  var achievements = {
    firstSearch:  { icon: '🔍', label: 'First Search' },
    shortcutPro:  { icon: '⌨️', label: 'Shortcut Discoverer' },
    nightOwl:     { icon: '🦉', label: 'Night Owl' },
    earlyBird:    { icon: '🌅', label: 'Early Bird' },
    deepReader:   { icon: '📖', label: 'Deep Reader' },
    speedNav:     { icon: '⚡', label: 'Speed Navigator' },
    detailOriented: { icon: '🔬', label: 'Detail Oriented' }
  };

  function hasAchievement(key) {
    return sessionStorage.getItem('ach_' + key) === '1';
  }

  function grantAchievement(key) {
    if (hasAchievement(key)) return;
    var a = achievements[key];
    if (!a) return;
    sessionStorage.setItem('ach_' + key, '1');

    var t = document.getElementById('toast');
    if (!t) return;
    t.innerHTML = '<span style="font-size:1.2em;animation:iconPulse .4s ease">' + a.icon + '</span> ' + a.label;
    t.classList.add('show', 'achievement-toast');
    setTimeout(function() {
      t.classList.remove('show', 'achievement-toast');
      t.innerHTML = '';
    }, 2800);
  }

  window.grantAchievement = grantAchievement;

  // -- First Search: type 3+ chars in college lookup
  var lookupInput = document.getElementById('collegeLookup');
  if (lookupInput) {
    lookupInput.addEventListener('input', function() {
      if (this.value.length >= 3) grantAchievement('firstSearch');
    });
  }

  // -- Shortcut Discoverer: wrap keyboard handler
  // Hooks into existing keydown — if any shortcut key pressed
  var shortcutKeys = ['1','2','3','4','5','6','7','8','9','0','f','g','v','z','/','?'];
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (shortcutKeys.indexOf(e.key.toLowerCase()) >= 0 || e.key === '?') {
      grantAchievement('shortcutPro');
    }
  });

  // -- Night Owl / Early Bird: time-based
  var hour = new Date().getHours();
  if (hour >= 20 || hour < 5) {
    setTimeout(function() { grantAchievement('nightOwl'); }, 3000);
  } else if (hour < 7) {
    setTimeout(function() { grantAchievement('earlyBird'); }, 3000);
  }

  // -- Deep Reader: expand 5+ cards
  var expandCount = 0;
  document.addEventListener('click', function(e) {
    var card = e.target.closest && (
      e.target.closest('.b-card') || e.target.closest('.ai-card') ||
      e.target.closest('.counsel-card') || e.target.closest('.esc-card')
    );
    if (card) {
      expandCount++;
      if (expandCount >= 5) grantAchievement('deepReader');
    }
  });

  // -- Speed Navigator: use TOC 3 times within 30s
  var tocTimes = [];
  var origTocGo = window.tocGo;
  if (typeof origTocGo === 'function') {
    window.tocGo = function(sectionId) {
      var now = Date.now();
      tocTimes.push(now);
      // Keep only last 30s
      tocTimes = tocTimes.filter(function(t) { return now - t < 30000; });
      if (tocTimes.length >= 3) grantAchievement('speedNav');
      return origTocGo(sectionId);
    };
  }

  // -- Detail Oriented: click all 5 tracer layers
  var tracerClicked = {};
  var origSetStage = window.setStage;
  if (typeof origSetStage === 'function') {
    window.setStage = function(n) {
      tracerClicked[n] = true;
      if (Object.keys(tracerClicked).length >= 5) grantAchievement('detailOriented');
      return origSetStage(n);
    };
  }


  // ═══ FEATURE 3: CARD TILT-ON-HOVER ═══
  // Subtle 3D perspective following cursor — ±3° max

  if (!isMobile && !reducedMotion) {
    document.querySelectorAll('.tool-frame').forEach(function(card) {
      card.classList.add('tilt-enabled');
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;  // -1 to 1
        var my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        card.style.setProperty('--mx', mx);
        card.style.setProperty('--my', my);
      });
      card.addEventListener('mouseleave', function() {
        card.style.setProperty('--mx', 0);
        card.style.setProperty('--my', 0);
      });
    });
  }


  // ═══ FEATURE 4: TIME-OF-DAY AWARENESS ═══

  // -- Greeting message
  var greetEl = document.getElementById('greetingToast');
  if (greetEl) {
    var msg;
    if (hour >= 22 || hour < 5) {
      msg = 'Working late? 🦉';
    } else if (hour < 12) {
      msg = 'Good morning 👋';
    } else if (hour < 17) {
      msg = 'Good afternoon 👋';
    } else {
      msg = 'Good evening 👋';
    }
    greetEl.innerHTML = '<span class="gt-wave">' + msg.slice(-2) + '</span> ' + msg.slice(0, -3) + ' — Built for the Application Support Analyst I role at FHDA';
  }

  // -- Evening selection color
  if (hour >= 18 || hour < 6) {
    document.body.classList.add('evening-mode');
  }

  // -- Tracker encouragement tooltips
  var trackerEl = document.getElementById('exploreTracker');
  if (trackerEl) {
    var labelEl = document.getElementById('etLabel');
    if (labelEl) {
      var obsTip = new MutationObserver(function() {
        var text = labelEl.textContent || '';
        var num = parseInt(text) || 0;
        if (num <= 3) trackerEl.title = 'Great start!';
        else if (num <= 7) trackerEl.title = 'On a roll!';
        else if (num >= 10) trackerEl.title = 'You explored everything!';
      });
      obsTip.observe(labelEl, { childList: true, characterData: true, subtree: true });
    }
  }


  // ═══ FEATURE 5: LOGO MICRO-INTERACTION ═══
  // Click nav icon → bounce → wiggle → flip → reset

  var navIcon = document.querySelector('.nav-icon');
  if (navIcon) {
    var logoState = 0;
    var logoAnims = ['logo-bounce', 'logo-wiggle', 'logo-flip'];
    navIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      // Remove all animation classes
      logoAnims.forEach(function(c) { navIcon.classList.remove(c); });
      if (logoState < logoAnims.length) {
        // Force reflow to restart animation
        void navIcon.offsetWidth;
        navIcon.classList.add(logoAnims[logoState]);
        logoState++;
      } else {
        logoState = 0;
      }
    });
  }


  // ═══ FEATURE 6: COMPLETION CELEBRATION ═══
  // 10/10 exploration AND 50+ interactions → full celebration

  var celebrated = false;
  var labelObs = document.getElementById('etLabel');
  var countObs = document.getElementById('interactionCount');

  function checkCelebration() {
    if (celebrated) return;
    var etText = labelObs ? labelObs.textContent : '';
    var etCount = parseInt(etText) || 0;
    var interactions = parseInt(countObs ? countObs.textContent : '0') || 0;

    if (etCount >= 10 && interactions >= 50) {
      celebrated = true;

      // Footer warm gradient
      var footer = document.querySelector('.site-footer');
      if (footer) footer.classList.add('footer-celebration');

      // Counter text
      var counterEl = document.getElementById('interactionCounter');
      if (counterEl) counterEl.innerHTML = '✨ You\'ve seen it all';

      // Tracker ring → rainbow gradient (inject SVG defs)
      var etFill = document.getElementById('etFill');
      if (etFill) {
        var svg = etFill.closest('svg');
        if (svg) {
          var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          defs.innerHTML = '<linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#0F766E"/>' +
            '<stop offset="25%" stop-color="#3B82F6"/>' +
            '<stop offset="50%" stop-color="#8B5CF6"/>' +
            '<stop offset="75%" stop-color="#EC4899"/>' +
            '<stop offset="100%" stop-color="#F59E0B"/>' +
            '</linearGradient>';
          svg.insertBefore(defs, svg.firstChild);
          etFill.setAttribute('stroke', 'url(#rainbowGrad)');
          etFill.setAttribute('stroke-width', '3');
        }
      }

      // Confetti burst
      confettiBurstCenter(50);
    }
  }

  if (labelObs) {
    new MutationObserver(checkCelebration).observe(labelObs, { childList: true, characterData: true, subtree: true });
  }
  if (countObs) {
    new MutationObserver(checkCelebration).observe(countObs, { childList: true, characterData: true, subtree: true });
  }


  // ═══ FEATURE 7: KONAMI CODE EASTER EGG ═══
  // ↑↑↓↓←→←→BA → Matrix-style character rain

  var konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var konamiIdx = 0;
  var konamiFired = false;

  document.addEventListener('keydown', function(e) {
    if (konamiFired) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    var expected = konamiSeq[konamiIdx];
    if (e.key === expected || e.key.toLowerCase() === expected) {
      konamiIdx++;
      if (konamiIdx === konamiSeq.length) {
        konamiFired = true;
        konamiIdx = 0;
        matrixRain();
        var t = document.getElementById('toast');
        if (t) {
          t.textContent = 'You found the secret! 🎮';
          t.classList.add('show');
          setTimeout(function() { t.classList.remove('show'); }, 2800);
        }
        confettiBurstCenter(40);
      }
    } else {
      konamiIdx = 0;
    }
  });

  function matrixRain() {
    if (reducedMotion) return;
    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99998;overflow:hidden';
    document.body.appendChild(container);

    var chars = 'CVC OEI FHDA 🦉 BANNER CANVAS ETHOS API SIS EXCHANGE'.split('');
    var cols = Math.floor(window.innerWidth / 28);

    for (var i = 0; i < cols; i++) {
      var col = document.createElement('div');
      col.className = 'matrix-column';
      col.style.left = (i * 28) + 'px';
      col.style.animationDelay = (Math.random() * 2) + 's';
      col.style.animationDuration = (2 + Math.random() * 2) + 's';
      var text = '';
      for (var j = 0; j < 12; j++) {
        text += chars[Math.floor(Math.random() * chars.length)] + '\n';
      }
      col.textContent = text;
      container.appendChild(col);
    }

    setTimeout(function() { container.remove(); }, 4000);
  }


  // ═══ FEATURE 8: SCROLL MOMENTUM SQUEEZE ═══
  // Fast scrolling → subtle scaleY squeeze on sections

  if (!isMobile && !reducedMotion) {
    var lastScrollY = window.scrollY;
    var lastScrollTime = Date.now();
    var squeezeActive = false;

    window.addEventListener('scroll', function() {
      var now = Date.now();
      var dt = now - lastScrollTime;
      if (dt < 10) return; // debounce
      var velocity = Math.abs(window.scrollY - lastScrollY) / dt;
      lastScrollY = window.scrollY;
      lastScrollTime = now;

      if (velocity > 3 && !squeezeActive) {
        squeezeActive = true;
        document.body.classList.add('scroll-squeeze');
        setTimeout(function() {
          document.body.classList.remove('scroll-squeeze');
          squeezeActive = false;
        }, 200);
      }
    }, { passive: true });
  }

})();

/*  Features 9-14 temporarily disabled for debugging
// ═══ FEATURE 9: SCROLL DEPTH MILESTONES ═══
  // Celebrate how far the user has scrolled — 25%, 50%, 75%, 100%

  (function() {
    var depthHit = {};
    var depthMessages = {
      25: "You're 25% through — keep going!",
      50: "Halfway through the portfolio!",
      75: "Almost there — 75% explored!",
      100: "You scrolled the entire page!"
    };

    window.addEventListener('scroll', function() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      var pct = Math.round((window.scrollY / h) * 100);

      [25, 50, 75, 100].forEach(function(milestone) {
        if (pct >= milestone && !depthHit[milestone]) {
          depthHit[milestone] = true;
          // Brief delay to avoid stacking with exploration tracker toasts
          setTimeout(function() {
            toast(depthMessages[milestone]);
            if (milestone === 100) {
              confettiBurstCenter(30);
            }
          }, 800);
        }
      });
    }, { passive: true });
  })();


  // ═══ FEATURE 10: (Hero stat count-up handled by animations.js) ═══


  // ═══ FEATURE 11: SECTION FIRST-VISIT SPARKLE ═══
  // First time a section scrolls into view: brief shimmer on the eyebrow

  (function() {
    if (reducedMotion) return;
    var sparkled = {};

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        if (sparkled[id]) return;
        sparkled[id] = true;

        var eyebrow = entry.target.querySelector('.eyebrow');
        if (eyebrow) {
          eyebrow.classList.add('sparkle-in');
          setTimeout(function() { eyebrow.classList.remove('sparkle-in'); }, 1000);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.sec[id], .sec-alt[id]').forEach(function(sec) {
      obs.observe(sec);
    });
  })();


  // ═══ FEATURE 12: PROGRESS DOT PULSE ON UNVISITED ═══
  // Unvisited progress dots gently breathe to invite exploration

  (function() {
    if (reducedMotion || isMobile) return;
    var dots = document.querySelectorAll('.progress-dot');
    if (!dots.length) return;

    // Add breathing class to all dots initially
    dots.forEach(function(d) { d.classList.add('pd-breathe'); });

    // Remove breathing when dot becomes active (visited)
    var obs = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.target.classList.contains('pd-active')) {
          m.target.classList.remove('pd-breathe');
        }
      });
    });

    dots.forEach(function(d) {
      obs.observe(d, { attributes: true, attributeFilter: ['class'] });
    });
  })();


  // ═══ FEATURE 13: FOOTER ENTRANCE STAGGER ═══
  // Footer children stagger in when scrolled to (CSS class-based, safe fallback)

  (function() {
    if (reducedMotion) return;
    var footer = document.querySelector('.site-footer');
    if (!footer) return;

    footer.classList.add('footer-stagger');

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        footer.classList.add('footer-revealed');
      });
    }, { threshold: 0.1 });

    obs.observe(footer);

    // Safety fallback: reveal footer after 5s even if observer fails
    setTimeout(function() {
      if (!footer.classList.contains('footer-revealed')) {
        footer.classList.add('footer-revealed');
      }
    }, 5000);
  })();
End of features 9-14 */
