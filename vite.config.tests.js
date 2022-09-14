// Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved.

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const main = 'tests/index.ts'
const fileName = format => `lib.${format}.tests.js`
const name = process.env.npm_package_name
const entry = main
const formats = [ 'es' ]
const external = [
  'ava',
  'yup',
  '@cosmicverse/foundation',
  '@cosmicverse/patterns'
]
const globals = {}

const isWatch = mode => 'watch' === mode
const isDev = mode => 'development' === mode || isWatch(mode)

export default ({ mode }) => {
  const manifest = false
  const emptyOutDir = false
  const cssCodeSplit = true
  const sourcemap = false

  const minify = !isDev(mode)
  const watch = isWatch(mode)

  return defineConfig({
    plugins: [
      tsconfigPaths()
    ],
    build: {
      manifest,
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
