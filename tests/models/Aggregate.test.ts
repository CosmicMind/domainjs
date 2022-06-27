/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2022, Daniel Jonathan <daniel at cosmicverse dot org>
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

import { 
  uuidv4,
  guardFor,
} from '@cosmicverse/foundation'

import {
  Entity,
  Aggregate,
  defineAggregate,
  Event,
  EventTopics,
  defineEvent,
} from '../../src'

interface User extends Entity {
  name: string
  version: number
}

type UserEvent = Event<User>

const createUserEvent = defineEvent<UserEvent>({
  properties: {
    message: {
      validate: (event: UserEvent): boolean => guardFor(event),
    },
  },
})

interface UserTopics extends EventTopics {
  version: UserEvent
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
    this.publish('version', createUserEvent({
      id: '123',
      correlationId: '456',
      created: new Date(),
      message: this.root,
    }))
    return this.root.version
  }

  updateName(): void {
    this.root.name = 'daniel'
  }
}

const nameHandler = {
  validate: (value: string): boolean => 0 < value.length,
  // updated: (newValue: string, oldValue: string, state: Readonly<User>): void => {
  //   console.log('update', oldValue, newValue, state)
  // },
}

const createUser = defineAggregate(UserAggregate, {
  // trace: (target: Readonly<User>): void => {
  //   console.log('createUser', target)
  // },
  properties: {
    name: nameHandler,
  },
})

test('Aggregate: createAggregate', t => {
  const id = uuidv4()
  const created = new Date()
  const name = 'daniel'
  const version = 1

  const a1 = createUser({
    id,
    created,
    name: 'jonathan',
    version,
  })

  a1.subscribe('version', (event: UserEvent) => {
    console.log('subscriber', event)
  })

  a1.updateName()

  t.is(a1.id, id)
  t.is(a1.created, created)
  t.is(a1.name, name)
  t.is(a1.version, version)
})