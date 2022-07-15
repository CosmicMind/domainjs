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

import test from 'ava'

import { guardFor } from '@cosmicmind/foundation';

import {
  Entity,
  EntityError,
  defineEntity,
} from '../../src'

interface User extends Entity {
  readonly id: string
  readonly created: Date
  name: string
}

const createUser = defineEntity<User>({
  properties: {
    id: {
      validate: (value: string): boolean => 2 < value.length,
    },
    created: {
      validate: (value: Date): boolean => value instanceof Date,
    },
    name: {
      validate: (value: string): boolean => 2 < value.length,
    },
  },
})

test('Entity: interface', t => {
  const id = '123'
  const created = new Date()
  const name = 'daniel'

  const e1 = createUser({
    id,
    created,
    name: 'jonathan',
  })

  e1.name = 'daniel'

  t.is(e1.id, id)
  t.is(e1.created, created)
  t.is(e1.name, name)
})

test('Entity: partial validator', t => {
  const id = '123'
  const created = new Date()
  const name = 'daniel'

  const e1 = createUser({
    id,
    created,
    name: 'jonathan',
  })

  try {
    e1.name = ''
    t.false(true)
  }
  catch (error) {
    if (error instanceof EntityError) {
      t.is(error.name, 'EntityError')
      t.is(error.message, 'name is invalid')
    }
    else {
      t.false(true)
    }
  }

  t.is(e1.id, id)
  t.is(e1.created, created)
  t.not(name, e1.name)
})

test('Entity: EntityLifecycle', t => {
  const id = '123'
  const created = new Date()
  const name = 'daniel'

  const createEntity = defineEntity<User>({
    trace(target: User) {
      t.true(guardFor(target))
    },
    created(target: User) {
      t.true(guardFor(target))
    },
    updated(newTarget: User, oldTarget: User) {
      t.true(guardFor(newTarget))
      t.true(guardFor(oldTarget))
      t.is(newTarget.name, 'jonathan')
      t.is(name, oldTarget.name)
    },
    properties: {
      id: {
        validate: (value: string): boolean => {
          t.is(value, id)
          return 2 < value.length
        },
      },
      created: {
        validate: (value: Date): boolean => {
          t.is(value, created)
          return value instanceof Date
        },
      },
      name: {
        validate: (value: string): boolean => {
          t.true(2 < value.length)
          return 2 < value.length
        },
      },
    },
  })

  const e1 = createEntity({
    id,
    created,
    name,
  })

  t.is(e1.id, id)
  t.is(e1.created, created)

  e1.name = 'jonathan'

  t.is('jonathan', e1.name)
})
