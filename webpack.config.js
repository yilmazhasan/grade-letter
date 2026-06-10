const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    init: './js/init.js',
    utils: './js/utils.js',
    data: './js/data.js',
    app: './js/app.js',
    slider: './js/slider.js',
    slider_script: './js/slider_script.js',
    chart: './js/chart.js',
  },
  output: {
    filename: '[name].min.js',
    path: __dirname + '/dist/public/js',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: { keep_fnames: true },
        },
      }),
    ],
  },
};
