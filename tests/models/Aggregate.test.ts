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
  logger,
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

class EmailValue implements Value<string> {
  readonly value: string
  get domainAddress(): string {
    return this.value.split('@')[1]
  }
  constructor(value: string) {
    this.value = value
  }
}

const createEmailValue = defineValue(EmailValue, {
  validate: (value: string): boolean => 'string' === typeof string().email('email is invalid').strict(true).validateSync(value),
})

interface User extends Entity {
  name: string
  version: number
  email: EmailValue
}

type UserRegisterEvent = Event<User>

const createUserAggregateRegisterEvent = defineEvent<UserRegisterEvent>({
  properties: {
    message: {
      validate: (value: User): boolean => guardFor(value),
    },
  },
})

interface UserTopics extends EventTopics {
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

  registerAccount(): void {
    this.root.name = 'daniel'
    this.publish('register-user-account', createUserAggregateRegisterEvent({
      id: '123',
      correlationId: '456',
      created: new Date(),
      message: this.root,
    }))
  }
}

const createUserAggregate = defineAggregate(UserAggregate, {
  // trace: (target: Readonly<User>): void => {
  //   console.log('createUserAggregate', target)
  // },
  properties: {
    name: {
      validate: (value: string): boolean => 0 < value.length,
      // updated: (newValue: string, oldValue: string, state: Readonly<User>): void => {
      //   console.log('update', oldValue, newValue, state)
      // },
    },
  },
})

test('Aggregate: createAggregate', t => {
  const id = uuidv4()
  const created = new Date()
  const name = 'daniel'
  const version = 1

  const a1 = createUserAggregate({
    id,
    created,
    name: 'jonathan',
    version,
    email: createEmailValue('susan@domain.com'),
  })

  a1.subscribe('register-user-account', (event: UserRegisterEvent) => {
    logger.log(event.message)
  })

  a1.registerAccount()

  t.is(a1.id, id)
  t.is(a1.created, created)
  t.is(a1.name, name)
  t.is(a1.version, version)
})
