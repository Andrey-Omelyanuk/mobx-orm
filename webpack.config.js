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

    plugins: [
      new DtsBundlePlugin()
    ],

    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.ts']
    }
  }
}


function DtsBundlePlugin(){}
DtsBundlePlugin.prototype.apply = function (compiler) {
  compiler.plugin('done', function(){
    var dts = require('dts-bundle');
    dts.bundle({
      name: 'z-data',
      main: 'src/index.d.ts',
      out : '../dist/z-data.d.ts',
      removeSource: true,
      outputAsModuleFolder: true // to use npm in-package typings
    });
  });
};

