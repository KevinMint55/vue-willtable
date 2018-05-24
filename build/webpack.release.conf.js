'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.release.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.release.productionSourceMap ? config.release.devtool : false,
  entry: {
    app: './src/index.js'
  },
  output: {
    path: config.release.assetsRoot,
    publicPath: config.release.assetsPublicPath,
    filename: `${config.release.filename}.min.js`,
    library: config.release.library,
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.release.env
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      parallel: true
    }),
    new ExtractTextPlugin({
      filename: `${config.release.filename}.min.css`,
      allChunks: true,
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.release.productionSourceMap ? {
        safe: true,
        map: {
          inline: false
        }
      } : {
        safe: true
      }
    })
  ]
})

module.exports = webpackConfig
