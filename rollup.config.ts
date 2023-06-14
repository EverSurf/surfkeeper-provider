import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import path from 'path';

const outDir = 'vanilla';
const libName = 'surfkeeper';

export default {
    input: 'src/index.ts',
    output: [
        {
            format: 'iife',
            name: libName,
            file: path.join(outDir, 'surfkeeper.js'),
        },
        {
            format: 'iife',
            name: libName,
            file: path.join(outDir, 'surfkeeper.min.js'),
            plugins: [terser()],
        },
    ],
    plugins: [
        typescript({
            compilerOptions: {
                module: 'esnext',
            },
            outDir,
        }),
    ],
};
