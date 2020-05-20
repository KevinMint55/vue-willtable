const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseWebpackConfig = require('./webpack.base.conf');
const config = require('../config');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

const webpackConfig = {
  mode: 'production',
  context: resolve('./'),
  entry: {
    app: ['babel-polyfill', './example/main.js'],
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: config.build.assetsPublicPath,
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[name].[chunkhash].js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new UglifyJSPlugin({
      uglifyOptions: {
        output: {
          comments: false,
        },
      },
      parallel: true,
    }),
    new OptimizeCSSAssetsPlugin({}),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
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
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].css',
      chunkFilename: 'css/[name].[hash].css',
    }),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      // chunks: 'all'
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};

if (config.build.bundleAnalyzerReport) {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = merge(baseWebpackConfig, webpackConfig);
