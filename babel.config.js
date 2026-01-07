module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }], // Correct for NativeWind v4
    ],
    plugins: [
      // Remove 'nativewind/babel' from here
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: true,
        },
      ],
      'react-native-reanimated/plugin', // Always keep this as the LAST plugin if you use it
    ],
  };
};