/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2022, Daniel Jonathan <daniel at cosmicverse dot org>
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

import test from 'ava'

import { string } from 'yup'

import {
  Value,
  defineValue,
} from '../../src'

class Email implements Value<string> {
  readonly value: string
  get domainAddress(): string {
    return this.value.split('@')[1]
  }
  constructor(value: string) {
    this.value = value
  }
}

const createEmailValue = defineValue(Email, {
  // trace: (email: Email): void => {
  //   console.log('trace', email)
  // },

  validate: (value: string): boolean => {
    return 'string' === typeof string().email().strict(true).validateSync(value)
  },

  // created: (email: Email): void => {
  //   console.log('created', email)
  // },
})

test('Value: create value', t => {
  const e1 = 'susan@domain.com'
  const v1 = createEmailValue(e1)

  t.is(v1.value, e1)
})

test('Value: get computed value', t => {
  const e1 = 'susan@domain.com'
  const v1 = createEmailValue(e1)

  const e2 = 'bob@domain.com'
  const v2 = createEmailValue(e2)

  t.is(v1.value, e1)
  t.is(v2.value, e2)
  t.is(v1.domainAddress, v2.domainAddress)
})

test('Value: delete value', t => {
  const e1 = 'susan@domain.com'
  const v1 = createEmailValue(e1)

  const e2 = 'bob@domain.com'
  const v2 = createEmailValue(e2)

  t.is(v1.value, e1)
  t.is(v2.value, e2)
  t.is(v1.domainAddress, v2.domainAddress)
})