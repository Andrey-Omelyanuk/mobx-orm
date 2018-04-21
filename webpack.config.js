const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');


module.exports = function (env) {

  return {
    target: 'web',
		mode: 'development',

    entry: './src/index.ts',
    output: {
			path: path.resolve(__dirname, './dist'),
    	filename: 'z-data.js'
		},

    module: {
      rules: [
				{ test: /\.ts$/   , loader: 'ts-loader', exclude: /node_modules/, },
				{ test: /\.html$/ , loader: 'html-loader' }
      ]
    },

    plugins: [
      // inject dependencies to html
      new HtmlWebpackPlugin({ template: './src/index.html' }),
			// clean old files
      new CleanWebpackPlugin(['dist'])
    ],
    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.ts']
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
