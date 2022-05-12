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

import test from 'ava'
import { string } from 'yup'

import {
  FoundationTypeError,
  ProxyTypeError,
} from '@cosmicverse/foundation'

import {
  Value,
  validateValueFor,
  createValue,
  createValueFor,
} from '../src'

class ValueObject extends Value {}

test('Value: create', async t => {
  const type = 'Value'
  const createVO = createValue(type, string().defined().strict(true))

  const vo = createVO('daniel')
  t.true(validateValueFor(vo))
  t.is(vo.type, type)
  t.is(vo.value, 'daniel')
})

test('Value: create ValueObject', async t => {
  const type = 'ValueObject'
  const createVO = createValueFor(ValueObject, string().defined().strict(true))

  const vo = createVO('daniel')
  t.true(validateValueFor(vo, ValueObject))
  t.is(vo.type, type)
  t.is(vo.value, 'daniel')
})

test('Value: validation', async t => {
  const type = 'Value'
  const errorMessage = 'string is invalid'
  const createVO = createValue(type, string().typeError(errorMessage).defined().strict(true))

  try {
    const vo = createVO(38)
    t.true('undefined' === typeof vo)
  }
  catch (e) {
    t.true(e instanceof Error)
    t.true(e instanceof FoundationTypeError)
    t.true(e instanceof ProxyTypeError)
    t.is(e.name, 'ProxyTypeError')
    t.is(e.message, errorMessage)
  }
})

test('Value: virtual string', async t => {
  const type = 'Value'
  const createVO = createValue(type, string().defined().strict(true), {
    get fullName(): string {
      const value = this.value
      const result = value.charAt(0).toUpperCase() + value.slice(1);
      return `${result} Jonathan`
    },
  })

  const vo = createVO('daniel')
  t.true(validateValueFor(vo))
  t.is(vo.type, type)
  t.is(vo.value, 'daniel')
  t.is(vo.fullName, 'Daniel Jonathan')
})
