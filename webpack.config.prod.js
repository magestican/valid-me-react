import webpack from 'webpack';
import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production'),
  __DEV__: false
};

export default {
  devtool : 'source-map', // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool

  entry : './src/main',
  target : 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
  output : {
    // name of the global var: "Foo"
    libraryTarget: 'commonjs2',
    path: `${__dirname}/dist`,
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins : [
    new webpack.ProvidePlugin({$: 'jquery', jQuery: 'jquery', 'window.jQuery': 'jquery', React: 'react'}),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBALS), // Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
    new ExtractTextPlugin('styles.css'),
    new webpack.optimize.UglifyJsPlugin()
  ],
  resolveLoader: {
    moduleExtensions: ["-loader"]
  },
  module : {

    rules: [
      {
        include: path.join(__dirname, 'src'),
        use: [
          {
            loader: 'react-hot'
          }, {

            loader: 'babel-loader'
          }
        ],
        test: /\.jsx$/
      }, {
        include: path.join(__dirname, 'src'),
        use: [
          {
            loader: 'babel-loader'
          }
        ],
        test: /\.js$/
      }, {
        use: [
          {
            loader: 'expose?$'
          }

        ],
        test: /jquery\.js$/
      }, {
        use: [
          {
            loader: 'expose?jQuery'
          }
        ],
        test: /jquery\.js$/
      }
    ]
  }
};
