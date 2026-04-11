// ═══════════════════════════════════════════════════════
// SERVICE WORKER — AppAnalyst Hub offline support
// Cache-first strategy: all static assets (HTML, CSS, JS)
// are cached on install; network is tried first only for
// things not in the cache (external links, fonts).
// Bumping CACHE_VERSION invalidates old caches on next load.
// ═══════════════════════════════════════════════════════

// Bump this when any cached file changes so old clients reload the new assets.
var CACHE_VERSION = 'appanalyst-v12';
var PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  // Stylesheets
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './css/sections.css',
  './css/nav.css',
  './css/animations.css',
  './css/modes.css',
  './css/responsive.css',
  './css/print.css',
  // Data modules
  './js/data/colleges.js',
  './js/data/kb.js',
  './js/data/flow.js',
  './js/data/barriers.js',
  './js/data/tracer.js',
  './js/data/patterns.js',
  './js/data/outreach.js',
  './js/data/journey.js',
  './js/data/ai-vision.js',
  // Core + persistence
  './js/storage.js',
  './js/app.js',
  // Tools
  './js/tickets.js',
  './js/lookup.js',
  './js/kb.js',
  './js/today.js',
  './js/search.js',
  './js/reconcile.js',
  './js/onboarding.js',
  './js/backup.js',
  './js/escalation.js',
  './js/theme.js',
  './js/realMonitor.js',
  './js/realPatterns.js',
  './js/realTracer.js',
  './js/realComms.js',
  './js/navBadge.js',
  './js/welcome.js',
  './js/realOutreach.js',
  './js/undo.js',
  './js/sync.js',
  './js/activity.js',
  './js/autosave.js',
  './js/role.js',
  './js/forStudents.js',
  './js/forCounselors.js',
  './js/packet.js',
  './js/router.js',
  './js/forRoles.js',
  './js/glossary.js',
  './js/externalTools.js',
  './js/quickRefCards.js',
  './js/tooltips.js',
  './js/pwa.js',
  './js/manager.js',
  './js/handoff.js',
  './js/notifications.js',
  './js/annualReview.js',
  './js/storageHealth.js',
  './js/quickCapture.js',
  './js/focusMode.js',
  './js/monitor.js',
  './js/tracer.js',
  './js/flow.js',
  './js/patterns.js',
  './js/barriers.js',
  './js/outreach.js',
  './js/journey.js',
  './js/ai-vision.js',
  './js/comms.js',
  './js/nav.js',
  './js/animations.js',
  './js/modes.js',
  './js/keyboard.js',
  './js/delight.js',
  './js/fhda.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      // Use {cache:'reload'} so we get fresh copies on install
      return cache.addAll(PRECACHE_URLS.map(function(url) {
        return new Request(url, { cache: 'reload' });
      }));
    }).then(function() {
      return self.skipWaiting();
    }).catch(function(err) {
      // Don't fail install if one file is missing
      console.warn('SW precache partial failure:', err);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_VERSION; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  // Skip cross-origin (fonts, external APIs)
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Cache-first with network fallback + update
  event.respondWith(
    caches.match(req).then(function(cached) {
      if (cached) {
        // Refresh cache in background
        fetch(req).then(function(fresh) {
          if (fresh && fresh.status === 200) {
            caches.open(CACHE_VERSION).then(function(cache) {
              cache.put(req, fresh);
            });
          }
        }).catch(function() { /* offline, ignore */ });
        return cached;
      }
      return fetch(req).then(function(fresh) {
        if (fresh && fresh.status === 200 && fresh.type === 'basic') {
          var clone = fresh.clone();
          caches.open(CACHE_VERSION).then(function(cache) {
            cache.put(req, clone);
          });
        }
        return fresh;
      }).catch(function() {
        // Offline + not in cache → fall back to index.html for nav requests
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
