const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function (env) {

  return {
    target: 'web',

    entry: './src/index.ts',
    output: { filename: 'z-data.js', path: path.join(__dirname, "dist") },

    module: {
      loaders: [
        // linters
        //{ test: /\.styl$/, loader: 'stylint-loader', exclude: /node_modules/, enforce: 'pre' },
        //{ test: /\.ts$/  , loader: 'tslint-loader' , exclude: /node_modules/, enforce: 'pre' },

				//
				{ test: /\.vue$/, loader: 'vue-loader' },
				//
				{ test: /\.ts$/   , loader: 'ts-loader', exclude: /node_modules|vue\/src/,  options: { appendTsSuffixTo: [/\.vue$/] } },
				{ test: /\.html$/ , loader: 'html-loader' },
				{ test: /\.pug$/  , loader: 'pug-loader' },
      ]
    },

    plugins: [
      // https://github.com/th0r/webpack-bundle-analyzer
      // new BundleAnalyzerPlugin(),
      // inject dependencies to html
      new HtmlWebpackPlugin({ template: './src/index.html' }),
			// clean old files
      new CleanWebpackPlugin(['dist'])
    ],
    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.ts', '.vue'],
			alias: {
				vue: 'vue/dist/vue.js',
				medusa: path.resolve(__dirname, 'src/medusa/'),
			}
    },
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      //compress: true,
      port: 3000,
      // hot: true,
      historyApiFallback: {
        disableDotRule: true
      }
    }
  };
};
