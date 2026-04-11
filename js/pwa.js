// ═══════════════════════════════════════════════════════
// PWA — Service worker registration + install prompt.
// Shows an "Install app" button when the browser offers
// the beforeinstallprompt event. Also shows an offline
// indicator when the browser reports offline status.
// ═══════════════════════════════════════════════════════

var PWA_DEFERRED_PROMPT = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js').then(function(reg) {
      // Listen for updates
      reg.addEventListener('updatefound', function() {
        var newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', function() {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // A new version is available
            pwaShowUpdateToast();
          }
        });
      });
    }).catch(function(err) {
      console.warn('SW registration failed:', err);
    });
  });
}

// Capture the install prompt for later
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  PWA_DEFERRED_PROMPT = e;
  pwaShowInstallButton();
});

window.addEventListener('appinstalled', function() {
  PWA_DEFERRED_PROMPT = null;
  var btn = document.getElementById('pwaInstallBtn');
  if (btn) btn.remove();
  toast('Installed — you can now open AppAnalyst Hub like a native app');
});

function pwaShowInstallButton() {
  if (document.getElementById('pwaInstallBtn')) return;
  var wrap = document.querySelector('.today-head-actions');
  if (!wrap) {
    setTimeout(pwaShowInstallButton, 500);
    return;
  }
  var btn = document.createElement('button');
  btn.id = 'pwaInstallBtn';
  btn.className = 'today-btn today-btn-pwa';
  btn.innerHTML = '<span style="font-size:.85rem;line-height:1">\u2B73</span> Install app';
  btn.title = 'Install AppAnalyst Hub as an app on this device';
  btn.onclick = pwaTriggerInstall;
  wrap.appendChild(btn);
}

function pwaTriggerInstall() {
  if (!PWA_DEFERRED_PROMPT) { toast('Install not available on this browser'); return; }
  PWA_DEFERRED_PROMPT.prompt();
  PWA_DEFERRED_PROMPT.userChoice.then(function(result) {
    if (result.outcome === 'accepted') {
      toast('Installing...');
    }
    PWA_DEFERRED_PROMPT = null;
  });
}

function pwaShowUpdateToast() {
  // Subtle notice — don't force reload, let user choose
  var t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = '<span>A new version is ready. <a href="#" onclick="event.preventDefault();location.reload()" style="color:var(--primary);text-decoration:underline">Reload</a> to apply.</span>';
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 10000);
}

// Offline indicator
function pwaUpdateOfflineBanner() {
  var banner = document.getElementById('offlineBanner');
  if (!banner) {
    if (!navigator.onLine) {
      banner = document.createElement('div');
      banner.id = 'offlineBanner';
      banner.className = 'offline-banner';
      banner.innerHTML = '<span class="offline-dot"></span>Offline \u2014 your data is local so everything still works';
      document.body.appendChild(banner);
    }
    return;
  }
  banner.style.display = navigator.onLine ? 'none' : 'flex';
}

window.addEventListener('online', pwaUpdateOfflineBanner);
window.addEventListener('offline', pwaUpdateOfflineBanner);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', pwaUpdateOfflineBanner);
} else {
  pwaUpdateOfflineBanner();
}
