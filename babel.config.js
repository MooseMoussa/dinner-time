module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
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