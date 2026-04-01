const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

const pwaTags = `
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#0B0B14" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="FORGA" />
  <link rel="apple-touch-icon" href="/pwa-icon.png" />`;

let html = fs.readFileSync(indexPath, 'utf8');

if (html.includes('rel="manifest"')) {
  console.log('PWA tags already present, skipping.');
  process.exit(0);
}

html = html.replace('</head>', `${pwaTags}\n</head>`);

// Ensure viewport includes viewport-fit=cover for iPhone notch/status bar
if (html.includes('viewport') && !html.includes('viewport-fit=cover')) {
  html = html.replace(
    /(<meta name="viewport" content="[^"]*)/,
    '$1, viewport-fit=cover'
  );
  console.log('Added viewport-fit=cover to viewport meta tag');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('PWA tags injected into dist/index.html');
