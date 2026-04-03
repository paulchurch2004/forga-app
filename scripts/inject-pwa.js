const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

// ── Generate build version (timestamp-based) ──
const buildVersion = Date.now().toString(36);
console.log(`Build version: ${buildVersion}`);

// ── Copy & stamp sw.js into dist ──
const swSource = path.join(__dirname, '..', 'public', 'sw.js');
const swDest = path.join(distDir, 'sw.js');
let swContent = fs.readFileSync(swSource, 'utf8');
swContent = swContent.replace('__BUILD_VERSION__', buildVersion);
fs.writeFileSync(swDest, swContent, 'utf8');
console.log('Service worker copied to dist/sw.js with version stamp');

// ── PWA meta tags ──
const pwaTags = `
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#0B0B14" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="FORGA" />
  <link rel="apple-touch-icon" href="/pwa-icon.png" />`;

let html = fs.readFileSync(indexPath, 'utf8');

if (html.includes('rel="manifest"')) {
  console.log('PWA tags already present, skipping tag injection.');
} else {
  // Inject full-screen background color to eliminate white bands on iPhone PWA
  const pwaStyles = `
  <style>
    html, body {
      background-color: #0B0B14;
      min-height: 100%;
      margin: 0;
      padding: 0;
    }
    /* Safe area padding for iPhone notch/home indicator */
    body {
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }
  </style>`;

  html = html.replace('</head>', `${pwaTags}\n${pwaStyles}\n</head>`);
  console.log('PWA tags injected into dist/index.html');
}

// ── Service Worker registration script ──
// Injects before </body> — registers SW, auto-reloads on update
const swRegistration = `
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function(reg) {
      // Check for updates every 60 seconds
      setInterval(function() { reg.update(); }, 60000);
      reg.addEventListener('updatefound', function() {
        var newSW = reg.installing;
        if (newSW) {
          newSW.addEventListener('statechange', function() {
            if (newSW.state === 'activated') {
              // New version active — reload the page
              window.location.reload();
            }
          });
        }
      });
    });
    // Also reload when SW takes control (handles first-install edge case)
    var refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
</script>`;

if (!html.includes('serviceWorker.register')) {
  html = html.replace('</body>', `${swRegistration}\n</body>`);
  console.log('Service worker registration script injected');
}

// ── Fix: Zustand uses import.meta.env which requires type="module" ──
html = html.replace(
  /<script (src="[^"]*entry[^"]*\.js") defer><\/script>/,
  '<script type="module" $1></script>'
);
console.log('Added type="module" to entry script tag');

// Also fix deprecated apple-mobile-web-app-capable
html = html.replace('apple-mobile-web-app-capable', 'mobile-web-app-capable');

// Ensure viewport includes viewport-fit=cover for iPhone notch/status bar
if (html.includes('viewport') && !html.includes('viewport-fit=cover')) {
  html = html.replace(
    /(<meta name="viewport" content="[^"]*)/,
    '$1, viewport-fit=cover'
  );
  console.log('Added viewport-fit=cover to viewport meta tag');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Done! All PWA patches applied.');
