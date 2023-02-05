/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

import {
  it,
  expect,
  describe,
} from 'vitest'

import { string } from 'yup'

import {
  uuidv4,
  guard,
} from '@cosmicmind/foundationjs'

import {
  Entity,
  Aggregate,
  defineAggregate,
  Event,
  EventTopics,
  defineEvent,
  Value,
  defineValue,
} from '../../src'

class Email extends Value<string> {
  get domainAddress(): string {
    return this.value.split('@')[1]
  }
}

const createEmail = defineValue(Email, {
  validate: (value: string): boolean => 'string' === typeof string().email('email is invalid').strict(true).validateSync(value),
})

interface User extends Entity {
  readonly id: string
  readonly createdAt: Date
  name: string
  version: number
  email: Email
}

type UserRegisterEvent = Event

const createUserAggregateRegisterEvent = defineEvent<UserRegisterEvent>({
  attributes: {
    message: {
      validate: (value: User): boolean => guard(value),
    },
  },
})

type UserTopics = EventTopics & {
  'register-user-account-sync': UserRegisterEvent
  'register-user-account': UserRegisterEvent
}

class UserAggregate extends Aggregate<User, UserTopics> {
  get id(): string {
    return this.root.id
  }

  get createdAt(): Date {
    return this.root.createdAt
  }

  get name(): string {
    return this.root.name
  }

  get version(): number {
    return this.root.version
  }

  get _root(): User {
    return this.root
  }

  updateName(): void {
    this.root.name = 'jonathan'
  }

  registerAccountSync(): void {
    this.publishSync('register-user-account-sync', createUserAggregateRegisterEvent({
      id: '123',
      correlationId: '456',
      createdAt: new Date(),
      message: this.root,
    }))
  }

  registerAccount(): void {
    this.publish('register-user-account', createUserAggregateRegisterEvent({
      id: '123',
      correlationId: '456',
      createdAt: new Date(),
      message: this.root,
    }))
  }
}

describe('Aggregate', () => {
  it('createAggregate', () => {
    const id = uuidv4()
    const createdAt = new Date()
    const name = 'daniel'
    const version = 1
    const email = 'susan@domain.com'

    const createAggregate = defineAggregate(UserAggregate, {
      trace(target: User) {
        expect(guard(target)).toBeTruthy()
      },

      createdAt(target: User) {
        expect(guard(target)).toBeTruthy()
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
            return true
          },
        },

        name: {
          validate: (value: string): boolean => {
            expect(2 < value.length).toBeTruthy()
            return 2 < value.length
          },
        },

        version: {
          validate(value: number): boolean {
            expect(0 < value).toBeTruthy()
            return 0 < value
          },
        },

        email: {
          validate(value: Email): boolean {
            expect(email).toBe(value.value)
            return email === value.value
          },
        },
      },
    })

    const a1 = createAggregate({
      id,
      createdAt,
      name,
      version,
      email: createEmail(email),
    })

    // a1.subscribe('register-user-account-sync', (event: UserRegisterEvent) => {
    //   expect(event.message, a1._root)
    // })
    //
    // a1.subscribe('register-user-account', (event: UserRegisterEvent) => {
    //   expect(event.message, a1._root)
    // })

    a1.updateName()

    a1.registerAccountSync()
    a1.registerAccount()

    expect(a1.id).toBe(id)
    expect(a1.createdAt).toBe(createdAt)
    expect(a1.name).toBe('jonathan')
    expect(a1.version).toBe(version)
  })
})