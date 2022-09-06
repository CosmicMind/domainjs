/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2022, Daniel Jonathan <daniel at cosmicmind dot org>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { join } from 'path'

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import dts from 'vite-plugin-dts'

const name = process.env.npm_package_name
const formats = [ 'es' ]
const external = [
  '@cosmicmind/lib-foundation',
  '@cosmicmind/lib-patterns'
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