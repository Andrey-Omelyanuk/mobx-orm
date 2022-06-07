import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import dts from 'rollup-plugin-dts'
import pkg from "./package.json"
const moduleName = pkg.name.replace(/^@.*\//, "")
const author = pkg.author
const banner = `
  /**
   * @license
   * author: ${author}
   * ${moduleName}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`

export default [
    {
        input: './src/index.ts',
        output: [
            {   file        : pkg['main'],
                format      : "cjs",
                sourcemap   : pkg['main'] + '.map',
                banner,
            },
            {   file        : pkg['jsnext:main'], 
                format      : "es",
                sourcemap   : pkg['jsnext:main'] + '.map',
                banner,
            }
        ],
        plugins   : [
            typescript({
                exclude: ["e2e/", "**/*.spec.ts"]
            }),
            // terser(),
        ],
        external: [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.devDependencies || {}),
        ],
    },
    {
        input: "./src/index.ts",
        // NOTE: The second output is your bundled `.d.ts` file
        output: [{ file: pkg['typings'] , format: "es" }],
        plugins: [dts()],
    }
]