const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const { DefinePlugin } = require('webpack')
const path = require('path')

const styleLoader =
  process.env.NODE_ENV !== 'production' ? 'style-loader' : require('mini-css-extract-plugin').loader

module.exports = {
  entry: './src/index.ts',
  resolve: {
    // extensions: ['.vue', '.ts'] //会带来一些便利，但实际上会在一定程度上影响 webpack 的运行效率
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  },
  cache: {
    type: 'filesystem' // 已经内置了文件缓存 默认会把编译的结果缓存到内存中，通过配置缓存到文件系统中
  },
  module: {
    rules: [
      {
        test: /\.(t|j)s$/,
        exclude: /node_modules/,
        loader: 'babel-loader', // 使用use外部不能使用options，或者内部使用options
        options: {
          cacheDirectory: true
        }
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [styleLoader, 'css-loader', 'postcss-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: 'asset', // asset 在导出一个 data URI 和发送一个单独的文件之间自动选择 之前用url-loader [ext] 这里包含了.
        generator: {
          filename: 'images/[name]-[hash][ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource', // 发送一个单独的文件并导出 URL 之前用file-loader
        generator: {
          filename: 'fonts/[name]-[hash][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'webpack5-ts-vue3',
      template: 'index.html'
    }),
    new VueLoaderPlugin(),
    new DefinePlugin({
      __VUE_OPTIONS_API__: true, // 这两个是消除警告 options api开启
      __VUE_PROD_DEVTOOLS__: false // 生产关闭devtools
    })
  ]
}
