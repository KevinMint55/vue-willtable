const path = require('path');

module.exports = {
  dev: {
    assetsPublicPath: '/',
    port: 5001,
    styleLint: false,
    devtool: 'cheap-module-eval-source-map',
  },
  build: {
    assetsRoot: path.resolve(__dirname, './demo'),
    assetsPublicPath: '/willtable/',
    bundleAnalyzerReport: false,
  },
  release: {
    assetsRoot: path.resolve(__dirname, './dist'),
    assetsPublicPath: './',
    filename: 'vue-willtable',
    library: 'VueWilltable',
  },
};
