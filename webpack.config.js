const path = require('path');

module.exports = {
  entry: {
    app: './src/index.js',
    backend: './src/backend'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  devtool: 'cheap-module-source-map'
};
