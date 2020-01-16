const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
            init: "./js/init.js",
            utils: "./js/utils.js",
            data: "./js/data.js",
            app: "./js/app.js",
            slider: "./js/slider.js",
            slider_script: "./js/slider_script.js",
            chart: "./js/chart.js",
            // index: "./index.html",
            // style: "./css/style.css",
            // app_style: "./css/app-style.css"
  },
  output: {
    filename: '[name].min.js',
    path: __dirname + '/dist/public/js',
    chunkFilename: '[id].[chunkhash].js'
    // filename: 'main.js',
    // path: path.resolve(__dirname, 'dist'),
  },
  // optimization: {
  //   minimize: true,
  //   minimizer: [
  //     new TerserPlugin({
  //       terserOptions: {
  //       //   ecma: undefined,
  //       //   warnings: false,
  //       //   parse: {},
  //       //   compress: {},
  //       //   mangle: true, // Note `mangle.properties` is `false` by default.
  //       //   module: false,
  //       //   output: null,
  //       //   toplevel: false,
  //       //   nameCache: null,
  //       //   ie8: false,
  //         keep_classnames: undefined,
  //         keep_fnames: true,
  //       //   top_retain: false,
  //       //   toplevel: false,
  //       //   safari10: false,
  //         unused: false,
  //         // dead_code: false,
  //       //   drop_console: true,
  //       },
  //     }),
  //   ],
  // },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          warnings: false,
          parse: {},
          compress: {},
          mangle: true, // Note `mangle.properties` is `false` by default.
          output: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          unused: false,
          mangle: {
            keep_fnames: true
          }
        },
      }),
    ],
  },
};



// const webpack = require("webpack");

// module.exports = {
//   // Where to start bundling
//   entry: {
//     init: "./src/init.js",
//     util: "./src/utils.js",
//     data: "./src/data.js",
//     slider: "./src/slider.js",
//     script: "./src/script.js",
//     chart: "./src/chart.js"
//   },

//   // Where to output
//   output: {
//     // Output to the same directory
//     path: __dirname,

//     // Capture name from the entry using a pattern
//     filename: "main.js",
//   },

//   // How to resolve encountered imports
//   module: {
//     rules: [
//       {
//         test: /\.css$/,
//         use: ["style-loader", "css-loader"],
//       },
//       {
//         test: /\.js$/,
//         use: "babel-loader",
//         exclude: /node_modules/,
//       },
//     ],
//   },

//   // What extra processing to perform
//   plugins: [
//     new webpack.DefinePlugin({ ... }),
//   ],

//   // Adjust module resolution algorithm
//   resolve: {
//     alias: { ... },
//   },
// };