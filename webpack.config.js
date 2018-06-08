const path = require('path')


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

    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.ts']
    }
  }
}

