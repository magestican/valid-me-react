import webpack from 'webpack';
import path from 'path';

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('development'),
  __DEV__: true
};
export default {
  devtool: 'eval-source-map', // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool

  entry: [
    'webpack-hot-middleware/client?reload=true',
    'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
    './src/main'
  ],
  target: 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
  output: {
    // export itself to a global var
    libraryTarget: "umd",
    // name of the global var: "Foo"
    libraryExport: ['forceValidation','ValidMe','clearAllValidationErrors','phoneTypesEnum'],
    path: `${__dirname}/dist`, // Note: Physical files are only output by the production build task `npm run build`.
    publicPath: 'http://localhost:3000/', // Use absolute paths to avoid the way that URLs are resolved by Chrome when they're parsed from a dynamically loaded CSS blob. Note: Only necessary in Dev.
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin(GLOBALS), // Tells React to build in prod mode. https://facebook.github.io/react/downloads.htmlnew webpack.HotModuleReplacementPlugin());
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      React: 'react'
    })
  ],
  module: {
    loaders: [
      { test: /jquery\.js$/, loader: 'expose?$' },
      { test: /jquery\.js$/, loader: 'expose?jQuery' },
      {test: /\.jsx$/, include: path.join(__dirname, 'src'), loaders: ['react-hot','babel?presets[]=es2015']},
      {test: /\.js$/, include: path.join(__dirname, 'src'), loaders: ['babel']},
      {test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'file'},
      {test: /\.(woff|woff2)$/, loader: 'file-loader?prefix=font/&limit=5000'},
      {test: /\.ttf(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=application/octet-stream'},
      {test: /\.svg(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=image/svg+xml'},
      {test: /\.(jpe?g|png|gif)$/i, loaders: ['file']},
      {test: /\.ico$/, loader: 'file-loader?name=[name].[ext]'},
      { test: /\.json$/, loader: 'file-loader?name=[name].[ext]' },
      { test: /config.js$/, loader: 'file-loader?name=[name].[ext]' },
      {test: /(\.css|\.scss)$/, loaders: ['style', 'css?sourceMap', 'sass?sourceMap']}
    ]
  }
};
