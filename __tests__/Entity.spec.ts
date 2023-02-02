/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

import {
  it,
  expect,
  describe,
} from 'vitest'

import { guardFor } from '@cosmicmind/foundationjs'

import {
  Entity,
  EntityError,
  defineEntity,
} from '@/internal'

interface User extends Entity {
  readonly id: string
  readonly createdAt: Date
  name: string
}

const createUser = defineEntity<User>({
  attributes: {
    id: {
      validate: (value: string): boolean => 2 < value.length,
    },
    createdAt: {
      validate: (value: Date): boolean => guardFor(value),
    },
    name: {
      validate: (value: string): boolean => 2 < value.length,
    },
  },
})

describe('Entity', () => {
  it('interface', () => {
    const id = '123'
    const createdAt = new Date()
    const name = 'daniel'

    const e1 = createUser({
      id,
      createdAt,
      name: 'jonathan',
    })

    e1.name = 'daniel'

    expect(e1.id).toBe(id)
    expect(e1.createdAt).toBe(createdAt)
    expect(e1.name).toBe(name)
  })

  it('partial validator', () => {
    const id = '123'
    const createdAt = new Date()
    const name = 'daniel'

    const e1 = createUser({
      id,
      createdAt,
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
    expect(e1.createdAt).toBe(createdAt)
    expect(name).not.toBe(e1.name)
  })

  it('EntityLifecycle', () => {
    const id = '123'
    const createdAt = new Date()
    const name = 'daniel'

    const createEntity = defineEntity<User>({
      trace(model: User) {
        expect(guardFor(model)).toBeTruthy()
      },
      createdAt(target: User) {
        expect(guardFor(target))
      },
      attributes: {
        id: {
          validate: (value: string): boolean => {
            expect(value).toBe(id)
            return 2 < value.length
          },
        },
        createdAt: {
          validate: (value: Date): boolean => {
            expect(value).toBe(createdAt)
            return guardFor(value)
          },
        },
        name: {
          validate: (value: string): boolean => {
            expect(2 < value.length).toBeTruthy()
            return 2 < value.length
          },

          updated: (newValue: string, oldValue: string, model: User): void => {
            expect(newValue).toBe('jonathan')
            expect(oldValue).toBe(name)
            expect(model.id).toBe(id)
            expect(model.createdAt).toBe(createdAt)
            expect(model.name).toBe(name)
          },
        },
      },
    })

    const e1 = createEntity({
      id,
      createdAt,
      name,
    })

    expect(e1.id).toBe(id)
    expect(e1.createdAt).toBe(createdAt)

    e1.name = 'jonathan'

    expect('jonathan').toBe(e1.name)
  })
})