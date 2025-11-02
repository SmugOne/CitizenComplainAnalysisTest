module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        "moduleName": "@env",
        "path": ".env",
        "blocklist": null,    // changed from blacklist
        "allowlist": null,    // changed from whitelist
        "safe": false,
        "allowUndefined": true
      }],
      // react-native-reanimated plugin MUST be the last plugin in the array
      'react-native-reanimated/plugin'
    ],
  };
};