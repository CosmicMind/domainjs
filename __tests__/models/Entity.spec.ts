/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

import {
  it,
  expect,
  describe,
} from 'vitest'

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

describe('Entity', () => {
  it('interface', () => {
    const id = '123'
    const created = new Date()
    const name = 'daniel'

    const e1 = createUser({
      id,
      created,
      name: 'jonathan',
    })

    e1.name = 'daniel'

    expect(e1.id).toBe(id)
    expect(e1.created).toBe(created)
    expect(e1.name).toBe(name)
  })

  it('partial validator', () => {
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
      expect(true).toBeFalsy()
    }
    catch (error) {
      if (error instanceof EntityError) {
        expect(error.name).toBe('EntityError')
        expect(error.message).toBe('name is invalid')
      }
      else {
        expect(true).toBeFalsy()
      }
    }

    expect(e1.id).toBe(id)
    expect(e1.created).toBe(created)
    expect(name).not.toBe(e1.name)
  })

  it('EntityLifecycle', () => {
    const id = '123'
    const created = new Date()
    const name = 'daniel'

    const createEntity = defineEntity<User>({
      trace(target: User) {
        expect(guardFor(target)).toBeTruthy()
      },
      created(target: User) {
        expect(guardFor(target))
      },
      updated(newTarget: User, oldTarget: User) {
        expect(guardFor(newTarget)).toBeTruthy()
        expect(guardFor(oldTarget)).toBeTruthy()
        expect(newTarget.name).toBe('jonathan')
        expect(name).toBe(oldTarget.name)
      },
      properties: {
        id: {
          validate: (value: string): boolean => {
            expect(value).toBe(id)
            return 2 < value.length
          },
        },
        created: {
          validate: (value: Date): boolean => {
            expect(value).toBe(created)
            return value instanceof Date
          },
        },
        name: {
          validate: (value: string): boolean => {
            expect(2 < value.length).toBeTruthy()
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

    expect(e1.id).toBe(id)
    expect(e1.created).toBe(created)

    e1.name = 'jonathan'

    expect('jonathan').toBe(e1.name)
  })
})