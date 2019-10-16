const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseWebpackConfig = require('./webpack.base.conf');
const config = require('../config');

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
    libraryTarget: 'umd',
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
    new MiniCssExtractPlugin({
      filename: `${config.release.filename}.min.css`,
    }),
  ],
};

module.exports = merge(baseWebpackConfig, webpackConfig);
