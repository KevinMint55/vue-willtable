const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const betterProgress = require('better-webpack-progress');
const baseWebpackConfig = require('./webpack.base.conf');
const config = require('../config');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

const webpackConfig = {
  mode: 'development',
  context: resolve('./'),
  entry: {
    app: ['babel-polyfill', './example/main.js'],
  },
  devtool: config.dev.devtool,
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProgressPlugin(betterProgress({
      mode: 'compact', // or 'detailed' or 'bar'
    })),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve('example/index.html'),
      favicon: resolve('example/favicon.ico'),
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
      chunksSortMode: 'auto',
    }),
  ],
};

if (config.dev.styleLint) {
  const StyleLintPlugin = require('stylelint-webpack-plugin');
  webpackConfig.plugins.push(new StyleLintPlugin({
    files: ['**/src/**/*.{vue,htm,html,css,sss,less,scss,sass}'],
    configFile: path.resolve(__dirname, 'stylelintrc.js'),
    syntax: 'scss',
  }));
}

module.exports = merge(baseWebpackConfig, webpackConfig);
