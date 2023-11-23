# webpack5-ts-vue3_start

## 一、新建项目

node -v
v16.20.2

### 1. 进入文件夹，运行命令
```cmd
npm install typescript webpack webpack-cli -D

git init
npm init -y
npx tsc --init
```

### 2. 新建入口文件 src/index.ts

### 3. 新建打包命令
```json
  "scripts": {
    "build": "webpack"
  }
```

### 4. 添加ts解析工具

后续uninstall

```cmd
npm i ts-loader -D
```

```js
module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
};
```


### 5. 生成入口html
```bash
npm i html-webpack-plugin -D
```
根项目下添加index.html，见项目，注意ejs插值语法

配置文件`webpack.config.js`
```js
  plugins: [
    new HtmlWebpackPlugin({
      title: "webpack5-ts-vue",
      template: "./index.html",
    }),
  ],
```
6. 运行项目
index.ts中添加log，然后运行在浏览器上，无问题

## 二、开发服务器
```cmd
npm i webpack-dev-server -D
```

`webpack.config.js`添加
```js
module.exports = {
  // ...
  // webpack升级到5.0后，target默认值值会根据package.json中的browserslist改变，导致devServer的自动更新失效
  // 所以 development 环境下直接配置成 web
  target: "web",
  devServer: {
    hot: true,
    open: true
  },
  // ...
};
```

package.json中添加scripts
```js
"serve": "webpack serve"
```

`proxy`, 原理将我们本地发出的请求通过一个中间代理服务器，转发到真正的接口服务器。服务器之间的通信是没有跨域问题的。

proxy常用配置项如下：
```js
module.exports = {
  // ...
  devServer: {
    proxy: {
      "/api": {
        // 需要代理到的真实目标服务器，如/api/user会被代理到https://www.baidu.com/api/user
        target: "https://www.baidu.com",
        // 是否更改代理后请求的headers中host地址，某些安全级别较高的服务器会对此做校验
        changeOrigin: true,
        // 默认情况下不接受将请求转发到https的api服务器上，如果希望支持，可以设置为false
        secure: false,
        // 默认情况下/api也会写入到请求url中，通过这个配置可以将其删除
        pathRewrite: {
          "^/api": "/",
        },
      },
    },
  },
  // ...
};
```

## 三、配置文件拆分
新建 config 文件夹，新建 webpack.base.js 、 webpack.dev.js 和 webpack.prod.js 三个文件
```cmd
npm i webpack-merge -D
```
切割好了之后添加scripts
```js
{
  "scripts": {
    "build": "webpack --config ./config/webpack.prod.js",
    "serve": "webpack serve --config ./config/webpack.dev.js"
  }
}
```
需要注意的是，配置文件中的路径并没有因为将配置文件放进更深一层的 config 文件夹而修改，
这是因在 webpack 配置中有一个` context` 属性，该属性用来解析入口 entry point 和加载器 loader ，其默认值是 webpack 的启动目录，一般就是项目的根目录

## 四、打包各类文件

### 1. vue
```bash
npm i vue@next -S
```

安装vue-loader
```bash
npm install vue-loader -D
```
添加App.vue文件，index.ts文件，并添加内容

`webpack.base.js`文件中:
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
    ],
  },
};
```

对单文件解析
```bash
npm i @vue/compiler-sfc -D
```

然后配置对应的 vue 插件
它的作用是将你定义过的js、 css 等规则应用到 .vue 文件中去：
```js
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  plugins: [new VueLoaderPlugin()],
};
```

现在script部分交给了ts-loader处理，但是tsc并不知道如何处理.vue结尾的文件
```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
    ],
  },
  // ...
};
```

然后需要添加类型声明文件，需要在 src 目录下添加一个 shims-vue.d.ts 类型申明文件
```ts
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

### 2. ts
tsc只能将typescript转换为javascript，不会编译为低版本的js，以用于低版本的浏览器。

还是需要用babel
```bash
npm i babel-loader @babel/core @babel/preset-env @babel/preset-typescript -D
```

修改 webpack.base.js ：
```js
module.epxorts = {
  module: {
    rules: [
      {
        test: /\.(t|j)s$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },
};
```

项目根目录下babel.config.js:
```js
module.exports = {
  presets: [
    "@babel/preset-env",
    [
      "@babel/preset-typescript",
      {
        allExtensions: true, //支持所有文件扩展名
      },
    ],
  ],
};
```
目前为止可以删除ts-loader
```bash
npm uninstall ts-loader
```

### 3. scss文件

```bash
npm i style-loader css-loader postcss-loader postcss-preset-env sass-loader sass -D
```

webpack.base.js添加：
```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      },
    ],
  },
  // ...
};
```

postcss 是一个加工样式文件的工具，可以提供自动添加样式前缀、修改单位等功能等

根目录下添加postcss.config.js:
```js
module.exports = {
  plugins: ["postcss-preset-env"],
};
```

### 4. img
在 webpack5 之前，加载图片、字体等资源需要我们使用 url-loader、 file-loader 等来处理

从 webpack5 开始，我们可以使用内置的资源模块类型[Asset Modules type](https://webpack.js.org/guides/asset-modules/)，来替代这些 loader 的工作

资源模块类型 Asset Modules type 分为四种：

在 webpack5 之前，加载图片、字体等资源需要我们使用 url-loader、 file-loader 等来处理
从 webpack5 开始，我们可以使用内置的资源模块类型 Asset Modules type，来替代这些 loader 的工作
资源模块类型 Asset Modules type 分为四种：

asset/resource 发送一个单独的文件并导出 URL，之前通过使用 file-loader 实现

asset/inline 导出一个资源的 data URI，之前通过使用 url-loader 实现

asset/source 导出资源的源代码，之前通过使用 raw-loader 实现

asset 在导出一个 data URI 和发送一个单独的文件之间自动选择，之前通过使用 url-loader 实现，并且可以配置资源体积限制

```js
module.epxorts = {
  module: {
    rules: [
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        type: "asset",
        generator: {
          filename: "images/[name]-[hash][ext]",
        },
      },
    ],
  },
};
```
### 5. font
```js
module.epxorts = {
  module: {
    rules: [
      {
        test: /\.(eot|svg|ttf|woff2?|)$/,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name]-[hash][ext]",
        },
      },
    ],
  },
};
```

## 五、其他配置

### 1. 注入环境变量
```bash
npm i cross-env -D
```
npm 脚本前对应添加 cross-env NODE_ENV=development cross-env NODE_ENV=production

### 2. 提取样式文件
> For production builds it's recommended to extract the CSS from your bundle being able to use parallel loading of CSS/JS resources later on.

建议我们在生产环境使用 mini-css-extract-plugin 这个工具来抽离样式文件，这样在浏览器中可以拥有更好的加载效率

```bash
npm i mini-css-extract-plugin -D
```

`webpack.base.js`
```js
const styleLoader =
  process.env.NODE_ENV !== 'production' ? 'style-loader' : require('mini-css-extract-plugin').loader

  {
    test: /\.(sa|sc|c)ss$/,
    use: [styleLoader, 'css-loader', 'postcss-loader', 'sass-loader']
  },

```

`webpack.prod.js`
```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(baseConfig, {
  // ...
  plugins: [new MiniCssExtractPlugin()],
  // ...
});
```

### 3. 自动拷贝文件

我们有一个 lodash.min.js 文件放在了 public 文件夹下，现在我们想在项目中使用，有两个方案：
- 直接引入webpack依赖图里面
- 在index.html中script标签引入

第二种方式在生产环境下是失败的，因为 webpack 并不会解析 index.html

我们在public文件下需要copy的文件，详见项目
```bash
npm i copy-webpack-plugin -D
```
`webpack.prod.js`
```js
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = merge(baseConfig, {
  // ...
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "./public", to: "./public" }], // from后的路径是相对于项目的根目录，to后的路径是相对于打包后的dist目录
    }),
  ],
  // ...
});
```

开发环境下无需配置。webpack-dev-server ：浏览器请求的文件如果不是通过 webpack 提供，则默认到项目根目录中寻找

### 4. 清理打包目录

之前用clean-webpack-plugin
`webpack.pord.js`
```js
  output: {
    clean: true,
  },
```

### 5. 省略扩展名和设置路径别名
```js
const path = require("path")

resolve: {
    extensions: [".vue", ".ts"], // 一定程度上影响 webpack 的运行效率
     alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
```

### 6. 文件缓存
修改 webpack.base.js
```js
module.exports = {
  cache: {
    type: "filesystem", // 默认会把编译的结果缓存到内存中，通过配置可以缓存到文件系统中
  },
};
````

### 7. 代码分割
webpack 默认会把所有的依赖打包到一个 js 文件当中，
这个文件的大小会随着项目内容的增长而线性增大，导致浏览器加载变慢，
可以使用代码分隔的方法来缓解这个问题

`webpack.prod.js`
```js
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      // 选择对哪些文件进行拆分，默认是async，即只对动态导入的文件进行拆分
      chunks: "all",
      // 提取chunk的最小体积
      minSize: 20000,
      // 要提取的chunk最少被引用次数
      minChunks: 1,
      // 对要提取的trunk进行分组
      cacheGroups: {
        // 匹配node_modules中的三方库，将其打包成一个trunk
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: -10,
        },
        default: {
          // 将至少被两个trunk引入的模块提取出来打包成单独trunk
          minChunks: 2,
          name: "default",
          priority: -20,
        },
      },
    },
  },
  // ...
};
```

### 8. 其他
包打包分析
```bash
npm i webpack-bundle-analyzer -D
```

`webpack.prod.js`
```js
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  plugins: [
    // ...
    new BundleAnalyzerPlugin({
      analyzerMode: "disabled",
      generateStatsFile: true,
    }),
    // ...
  ],
};
```
每次打包完成之后，都会在打包文件目录中生成一个 stats.json 文件

在 package.json 中添加脚本：

```js
 "analyze": "webpack-bundle-analyzer --port 3000 ./dist/stats.json"
```

运行 npm run analyze 可自动打开包文件分析页面


## 六、代码规范

### 1. ESLint
```bash
npm i eslint -D
```

运行`npx eslint --init`

```bash
npx eslint --init
$ √ How would you like to use ESLint? · problems
$ √ What type of modules does your project use? · esm
$ √ Which framework does your project use? · vue
$ √ Does your project use TypeScript? · No / Yes
$ √ Where does your code run? · browser
$ √ What format do you want your config file to be in? · JavaScript
$ The config that you've selected requires the following dependencies:

@typescript-eslint/parser  @typescript-eslint/eslint-plugin eslint-plugin-vue
```
修改.eslintrc.js文件
```js
module.exports = {
  env: {
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 12,
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint', 'prettier'], // plugins extends 的prettier后面安装的
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-var-requires': 'off'
  }
}
````

```bash
npm i eslint-webpack-plugin -D
```

`webpack.dev.js`

```js
const ESLintPlugin = require("eslint-webpack-plugin");

  // 注意如果不声明文件扩展名，eslint默认只会检查js结尾的文件
  plugins: [new ESLintPlugin({ extensions: ["js", "ts", "vue"] })],
};
```
### 2. Prettier

```bash
npm i prettier eslint-config-prettier eslint-plugin-prettier -D
```

添加.prettierrc文件
```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "none",
  "semi": false,
  "endOfLine": "auto"
}
```

### 3. lint-staged
在git缓存区的时候，进行检查，这样效率会比较高。

使用lint-staged

```bash
npm i lint-staged -D
```

添加 lint-staged.config.js 配置文件：
```js
module.exports = {
  "src/**/*.{js,ts,vue}": [
    "eslint --fix --ext .js,.ts,.vue",
    "prettier --write",
  ],
};
```
这样在命令行执行 npx lint-staged 就能手动在暂存区运行 eslint+prettier 做代码风格校验了

### 4. husky
需要提交之前就格式化，我们使用husky + pre-commit 这个git钩子

添加script脚本
```
"prepare": "husky install"
```

然后运行这个命令，会生成一个.husky文件夹

然后运行
`
npx husky add .husky/pre-commit "npx lint-staged"
`

内部`pre-commit`，默认就会生成这个内容，无需修改。
```
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

现在每当你执行 commit 操作时，都会自动执行lint-staged，修复完了然后提交。



















