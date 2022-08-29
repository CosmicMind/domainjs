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

import { string } from 'yup'

import {
  uuidv4,
  guardFor,
} from '@libs/foundation'

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
  properties: {
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

  registerAccount(): Promise<UserRegisterEvent> {
    return this.publish('register-user-account', createUserAggregateRegisterEvent({
      id: '123',
      correlationId: '456',
      created: new Date(),
      message: this.root,
    }))
  }
}

test('Aggregate: createAggregate', async t => {
  const id = uuidv4()
  const created = new Date()
  const name = 'daniel'
  const version = 1
  const email = 'susan@domain.com'

  const createAggregate = defineAggregate(UserAggregate, {
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
      version: {
        validate(value: number): boolean {
          t.true(0 < value)
          return 0 < value
        },
      },
      email: {
        validate(value: Email): boolean {
          t.is(email, value.value)
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

  a1.subscribe('register-user-account-sync', (event: UserRegisterEvent) => {
    t.is(event.message, a1._root)
  })

  a1.subscribe('register-user-account', (event: UserRegisterEvent) => {
    t.is(event.message, a1._root)
  })

  a1.updateName()

  a1.registerAccountSync()
  await a1.registerAccount()

  t.is(a1.id, id)
  t.is(a1.created, created)
  t.is(a1.name, 'jonathan')
  t.is(a1.version, version)
})
