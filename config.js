const path = require('path')

module.exports = {
  dev: {
    assetsPublicPath: '/',
    port: 5000,
    styleLint: false,
    devtool: 'cheap-module-eval-source-map'
  },
  build: {
    assetsRoot: path.resolve(__dirname, './demo'),
    assetsPublicPath: '/',
    bundleAnalyzerReport: false
  },
  release: {
    assetsRoot: path.resolve(__dirname, './dist'),
    assetsPublicPath: '/',
    filename: 'km-excel',
    library: 'KmExcel'
  }
}
