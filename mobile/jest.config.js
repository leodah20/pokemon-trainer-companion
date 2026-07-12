module.exports = {
  preset: '@react-native/jest-preset',
  // @react-navigation and react-native-screens ship untranspiled ESM; Jest needs to transform
  // them too, not just skip everything under node_modules like it does by default.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-screens|react-native-safe-area-context)/)',
  ],
};
