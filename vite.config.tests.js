/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2022, Daniel Jonathan <daniel at cosmicverse dot com>
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

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const main = 'tests/index.ts'
const outDir = process.env.npm_out_dir
const fileName = format => `lib.${format}.tests.js`
const name = process.env.npm_package_name
const entry = main
const formats = [ 'es' ]
const external = [
  'ava',
  'dotenv',
  'eslint',
  'lib0',
  'yup'
]
const globals = {}

const isWatch = mode => 'watch' === mode
const isDev = mode => 'development' === mode || isWatch(mode)

export default ({ mode }) => {
  const manifest = false
  const emptyOutDir = false
  const cssCodeSplit = true
  const sourcemap = false

  const minify = isDev(mode) ? false : 'terser'
  const watch = isWatch(mode)

  return defineConfig({
    outDir,
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
