const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('../config');

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

const webpackConfig = {
  mode: 'production',
  entry: {
    app: ['./src/index.js'],
  },
  output: {
    path: config.release.assetsRoot,
    publicPath: config.release.assetsPublicPath,
    filename: `${config.release.filename}.min.js`,
    library: config.release.library,
    libraryTarget: 'umd'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new UglifyJSPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        },
        output: {
          comments: false
        }
      },
      parallel: true
    }),
    new OptimizeCSSAssetsPlugin({}),
    new MiniCssExtractPlugin({
      filename: `${config.release.filename}.min.css`
    })
  ]
}

module.exports = merge(baseWebpackConfig, webpackConfig);