// Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved.

import test from 'ava'

import { guardFor } from '@cosmicverse/foundation'

import {
  Entity,
  Event,
  defineEvent,
} from '../../src'

interface User extends Entity {
  name: string
}

const createUserEvent = defineEvent<Event<User>>({
  properties: {
    id: {
      validate: (value: string): boolean => 2 < value.length,
    },
    correlationId: {
      validate: (value: string): boolean => 2 < value.length,
    },
    created: {
      validate: (value: Date): boolean => value instanceof Date,
    },
    message: {
      validate: (value: User): boolean => guardFor(value),
    },
  },
})

test('Event: interface', t => {
  const id = '123'
  const correlationId = '456'
  const created = new Date()
  const message = {
    id,
    created,
    name: 'daniel',
  }

  const e1 = createUserEvent({
    id,
    correlationId,
    created,
    message,
  })

  t.is(e1.id, id)
  t.is(e1.correlationId, correlationId)
  t.is(e1.created, created)
  t.is(e1.message, message)
})

test('Event: EventLifecycle', t => {
  const id = '123'
  const correlationId = '456'
  const created = new Date()
  const message = {
    id,
    created,
    name: 'daniel',
  }

  const createEvent = defineEvent<Event<User>>({
    trace(target: Event<User>) {
      t.true(guardFor(target))
    },
    created(target: Event<User>) {
      t.true(guardFor(target))
    },
    properties: {
      id: {
        validate: (value: string): boolean => {
          t.is(value, id)
          return 2 < value.length
        },
      },
      correlationId: {
        validate: (value: string): boolean => {
          t.is(value, correlationId)
          return 2 < value.length
        },
      },
      created: {
        validate: (value: Date): boolean => {
          t.is(value, created)
          return value instanceof Date
        },
      },
      message: {
        validate: (value: User): boolean => {
          t.true(guardFor(value))
          return guardFor(value)
        },
      },
    },
  })

  const e1 = createEvent({
    id,
    correlationId,
    created,
    message,
  })

  t.is(e1.id, id)
  t.is(e1.correlationId, correlationId)
  t.is(e1.created, created)
  t.is(e1.message, message)
})