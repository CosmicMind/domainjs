/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

import {
  it,
  expect,
  describe,
} from 'vitest'

import { string } from 'yup'

import {
  uuidv4,
  guardFor,
} from '@cosmicmind/foundation'

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

class Email implements Value<string> {
  readonly value: string
  get domainAddress(): string {
    return this.value.split('@')[1]
  }
  constructor(value: string) {
    this.value = value
  }
}

const createEmail = defineValue(Email, {
  validate: (value: string): boolean => 'string' === typeof string().email('email is invalid').strict(true).validateSync(value),
})

interface User extends Entity {
  readonly id: string
  readonly created: Date
  name: string
  version: number
  email: Email
}

type UserRegisterEvent = Event<User>

const createUserAggregateRegisterEvent = defineEvent<UserRegisterEvent>({
  attributes: {
    message: {
      validate: (value: User): boolean => guardFor(value),
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

  get created(): Date {
    return this.root.created
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
      created: new Date(),
      message: this.root,
    }))
  }

  registerAccount(): void {
    this.publish('register-user-account', createUserAggregateRegisterEvent({
      id: '123',
      correlationId: '456',
      created: new Date(),
      message: this.root,
    }))
  }
}

describe('Aggregate', () => {
  it('createAggregate', () => {
    const id = uuidv4()
    const created = new Date()
    const name = 'daniel'
    const version = 1
    const email = 'susan@domain.com'

    const createAggregate = defineAggregate(UserAggregate, {
      trace(target: User) {
        expect(guardFor(target)).toBeTruthy()
      },
      created(target: User) {
        expect(guardFor(target)).toBeTruthy()
      },
      updated(newTarget: User, oldTarget: User) {
        expect(guardFor(newTarget)).toBeTruthy()
        expect(guardFor(oldTarget)).toBeTruthy()
        expect(newTarget.name).toBe('jonathan')
        expect(name).toBe(oldTarget.name)
      },
      attributes: {
        id: {
          validate: (value: string): boolean => {
            expect(value).toBe(id)
            return 2 < value.length
          },
        },
        created: {
          validate: (value: Date): boolean => {
            expect(value).toBe(created)
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
      created,
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
    expect(a1.created).toBe(created)
    expect(a1.name).toBe('jonathan')
    expect(a1.version).toBe(version)
  })
})