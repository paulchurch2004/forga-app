module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    overrides: [
      {
        test: /node_modules[\\/]zustand/,
        plugins: [['babel-plugin-transform-import-meta', { module: 'ES6' }]],
      },
    ],
  };
};
