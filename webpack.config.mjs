import path from 'path';
import { fileURLToPath } from 'url';
import nodeExternals from 'webpack-node-externals';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  target: 'node',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
    module: true,
    library: { type: 'module' }
  },
  externals: [nodeExternals()],
  experiments: { outputModule: true },
  resolve: { extensions: ['.js'] },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: '.env', to: '../.env' }
      ]
    })
  ],
  module: { rules: [] },
  devtool: 'source-map'
};
