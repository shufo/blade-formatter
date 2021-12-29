import * as path from 'path';
import * as webpack from 'webpack';

const nodeExternals = require('webpack-node-externals');

const config: webpack.Configuration = {
  entry: './src/cli.ts',
  mode: 'none',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: './cli-bundle.js',
    libraryTarget: 'commonjs',
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',
  optimization: {
    moduleIds: 'named',
  },
  resolve: {
    alias: {
      "vscode-oniguruma": path.resolve(__dirname),
    },
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
  },
  target: 'node',
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true
        },
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: 'source-map-loader' },
    ],
  },
  externals: [nodeExternals()],
  watchOptions: {
    ignored: [path.resolve(__dirname, "./types/**/*"), path.resolve(__dirname, "./dist/**/*")],
  },
};

export default config;
