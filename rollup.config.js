import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import dts        from 'rollup-plugin-dts'


export default [
{
    input     : './src/index.ts',
    output: [
        { file: 'dist/mobx-orm.js'       , sourcemap: 'dist/mobx-orm.js.map'       , format: "umd", name: 'MobX-ORM' },
        { file: 'dist/mobx-orm.es2015.js', sourcemap: 'dist/mobx-orm.es2015.js.map', format: "es"  }
    ],
    plugins   : [
        typescript(),
        terser(),
    ]
},
{
    input: "./src/index.ts",
    // NOTE: The second output is your bundled `.d.ts` file
    output: [{ file: "dist/mobx-orm.d.ts", format: "esm" }],
    plugins: [dts()],
}
]