/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

import test from 'ava'

import { guardFor } from '@cosmicmind/foundation'

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
