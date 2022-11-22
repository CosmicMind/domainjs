import {
URL,
fileURLToPath
} from 'node:url'

import {
defineConfig,
LibraryFormats
} from 'vite'

import dts from 'vite-plugin-dts'

const external = [
  'yup',
  '@cosmicmind/foundation',
  '@cosmicmind/patterns'
]
const globals = {}
const emptyOutDir = true
const formats: LibraryFormats[] = [ 'es' ]

export default defineConfig(({ mode }) => {
  const watch = 'watch' === mode ? {
    include: [
      './src/**/*'
    ],
  }: undefined

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      dts()
    ],
    build: {
      emptyOutDir,
      lib: {
        name: process.env.npm_package_name,
        entry: './src/index.ts',
        formats,
        fileName: 'lib.es',
      },
      rollupOptions: {
        external,
        output: {
          globals,
        },
      },
      watch,
    },
  }
})