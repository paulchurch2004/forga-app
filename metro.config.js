const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable proper ESM/package.json exports resolution (fixes import.meta errors on web)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
