#!/usr/bin/env node
// Generates the Apple Sign In "Secret Key" JWT to paste into Supabase.
// Local-only — your .p8 file never leaves your machine.
//
// Usage:
//   node scripts/gen-apple-secret.js /path/to/AuthKey_D494A7Y77L.p8
//
// Output: a single long JWT string, copy it and paste it into
// Supabase Dashboard -> Auth -> Providers -> Apple -> Secret Key (for OAuth).
// Apple requires regenerating this every 6 months max.

const crypto = require('node:crypto');
const fs = require('node:fs');

const TEAM_ID = 'Y35CAHJD3L';
const KEY_ID = 'D494A7Y77L';
const SERVICES_ID = 'fr.forga.signin';

const p8Path = process.argv[2];
if (!p8Path) {
  console.error('Usage: node scripts/gen-apple-secret.js /path/to/AuthKey_D494A7Y77L.p8');
  process.exit(1);
}

const privateKey = fs.readFileSync(p8Path, 'utf8');

const header = { alg: 'ES256', kid: KEY_ID };
const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: TEAM_ID,
  iat: now,
  exp: now + 60 * 60 * 24 * 180, // 180 days
  aud: 'https://appleid.apple.com',
  sub: SERVICES_ID,
};

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const headerB64 = b64url(JSON.stringify(header));
const payloadB64 = b64url(JSON.stringify(payload));
const toSign = `${headerB64}.${payloadB64}`;

const signature = crypto.sign(
  'SHA256',
  Buffer.from(toSign),
  { key: privateKey, dsaEncoding: 'ieee-p1363' },
);

const sigB64 = signature
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const jwt = `${toSign}.${sigB64}`;

console.log('\n=== APPLE SECRET KEY (copy everything between the lines) ===');
console.log(jwt);
console.log('=== END ===\n');
console.log(`Expires: ${new Date((now + 60 * 60 * 24 * 180) * 1000).toISOString()}`);
console.log(`Regenerate before this date.\n`);
