const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'web-build'),
    },
    historyApiFallback: true,
    port: 3000,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-web))/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              ['module-resolver', {
                alias: {
                  '^react-native$': 'react-native-web',
                },
              }],
            ],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-sqlite-storage': path.resolve(__dirname, 'src/services/DatabaseService.web.ts'),
      'react-native-geolocation-service': path.resolve(__dirname, 'src/services/web/GeolocationWeb.ts'),
      'react-native-face-detector': path.resolve(__dirname, 'src/services/web/FaceDetectorWeb.ts'),
      '@services/DatabaseService': path.resolve(__dirname, 'src/services/DatabaseService.web.ts'),
      '@models': path.resolve(__dirname, 'src/models'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
    fallback: {
      'fs': false,
      'path': false,
      'crypto': false,
      'stream': false,
      'buffer': false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './web/index.html',
      title: 'Dinner Time - Multi-User Dinner Decision App',
    }),
  ],
};
