// Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved.

import { join } from 'path'

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import dts from 'vite-plugin-dts'

const name = process.env.npm_package_name
const formats = [ 'es' ]
const external = [
  '@cosmicverse/foundation',
  '@cosmicverse/patterns'
]
const globals = {}

const dirname = process.cwd()
const dirPath = (path = '') => join(dirname, path)
const srcDir = (path = '') => join(dirPath('src'), path)
const rootDir = srcDir()
const assetsDir = false
const publicDir = false
const outDir = dirPath('dist')
const entry = 'index.ts'
const fileName = format => `lib.${format}.js`

const isWatch = mode => 'watch' === mode
const isDev = mode => 'development' === mode || isWatch(mode)

export default ({ mode }) => {
  const manifest = false
  const emptyOutDir = true
  const cssCodeSplit = true
  const sourcemap = false

  const minify = !isDev(mode)
  const watch = isWatch(mode)

  return defineConfig({
    root: rootDir,
    assetsDir,
    publicDir,
    plugins: [
      tsconfigPaths({
        root: dirPath(),
      }),
      dts({
        root: dirPath(),
      })
    ],
    build: {
      manifest,
      outDir,
      emptyOutDir,
      cssCodeSplit,
      sourcemap,
      lib: {
        name,
        entry,
        formats,
        fileName,
      },
      rollupOptions: {
        external,
        output: {
          globals,
        },
      },
      minify,
      watch,
    },
  })
}