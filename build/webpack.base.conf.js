const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = process.env.NODE_ENV === 'production';

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

const webpackConfig = {
  output: {
    filename: 'js/[name].js',
    publicPath: '/',
  },
  resolve: {
    modules: [
      'node_modules',
    ],
    extensions: ['.js', '.json', '.vue', '.scss'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('example'), resolve('node_modules/webpack-dev-server/client')],
        options: {
          formatter: require('eslint-friendly-formatter'),
          emitWarning: true,
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              isProduction ? MiniCssExtractPlugin.loader : 'vue-style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[local]_[hash:base64:8]',
                  },
                },
              },
              'postcss-loader',
              'sass-loader',
            ],
          },
          {
            use: [
              isProduction ? MiniCssExtractPlugin.loader : 'vue-style-loader',
              'css-loader',
              'postcss-loader',
              'sass-loader',
            ],
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              name: 'img/[name].[hash:7].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: 'media/[name].[hash:7].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: 'fonts/[name].[hash:7].[ext]',
        },
      },
    ],
  },
  node: {
    setImmediate: false,
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
};

module.exports = webpackConfig;
