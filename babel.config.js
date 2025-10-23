module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-transform-class-properties', {loose: true}],
    ['@babel/plugin-transform-private-methods', {loose: true}],
    ['@babel/plugin-transform-private-property-in-object', {loose: true}],
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@models': './src/models',
          '@services': './src/services',
          '@api': './src/api',
          '@performance': './src/performance',
          '@storage': './src/storage',
        },
      },
    ],
  ],
};