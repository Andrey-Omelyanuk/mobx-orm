const path = require('path')
const TypescriptDeclarationPlugin = require('typescript-declaration-webpack-plugin');


module.exports = function (env) {
  return {
		mode: 'production',
		devtool: "source-map",

		entry: './src/index.ts',
    output: {
    	filename			: 'z-data.js',
			path					: path.resolve(__dirname, './dist'),
			library				: 'zData',
			libraryTarget	: 'umd',
		},

    module: {
      rules: [
				{ test: /\.ts$/, loader: 'ts-loader'    , exclude: /node_modules/, },
				{ test: /\.ts$/, loader: 'tslint-loader', exclude: /node_modules/, }
      ]
    },

    plugins: [
      new TypescriptDeclarationPlugin({
        out: 'z-data.d.ts'
      })
    ],

    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.ts']
    }
  }
}

