module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "@babel/plugin-proposal-export-namespace-from",
      ["module:react-native-dotenv", {
        moduleName: '@env',
        path: `.env.${process.env.APP_VARIANT || 'development'}`,
        safe: false,
        allowUndefined: true,
        defaults: true
      }],
      'react-native-reanimated/plugin',
    ],
  };
};