/**
 * BSD 3-Clause License
 *
 * Copyright © 2023, Daniel Jonathan <daniel at cosmicmind dot com>
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
 * SERVICES LOSS OF USE, DATA, OR PROFITS OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import {
  it,
  expect,
  describe,
} from 'vitest'

import { guard } from '@cosmicmind/foundationjs'

import {
  Entity,
  Event,
  defineEvent,
} from '@/internal'

type User = Entity & {
  name: string
}

type UserEvent = Event & {
  id: string
  createdAt: Date
  correlationId: string
  entity: User
}

const createUserEvent = defineEvent<UserEvent>({
  attributes: {
    id: {
      validate: (value: string): boolean => 2 < value.length,
    },

    correlationId: {
      validate: (value: string): boolean => 2 < value.length,
    },

    createdAt: {
      validate: (value: Date): boolean => guard<Date>(value),
    },

    entity: {
      validate: (value: User): boolean => guard<User>(value),
    },
  },
})

describe('Event', () => {
  it('interface', () => {
    const id = '123'
    const correlationId = '456'
    const createdAt = new Date()
    const entity = {
      id,
      createdAt,
      name: 'daniel',
    }

    const e1 = createUserEvent({
      id,
      correlationId,
      createdAt,
      entity,
    })

    expect(e1.id).toBe(id)
    expect(e1.correlationId).toBe(correlationId)
    expect(e1.createdAt).toBe(createdAt)
    expect(e1.entity).toStrictEqual(entity)
  })

  it('EventLifecycle', () => {
    const id = '123'
    const correlationId = '456'
    const createdAt = new Date()
    const entity = {
      id,
      createdAt,
      name: 'daniel',
    }

    const createEvent = defineEvent<UserEvent>({
      trace(event: Event) {
        expect(guard<Event>(event)).toBeTruthy()
      },

      createdAt(event: Event) {
        expect(guard<Event>(event)).toBeTruthy()
      },

      attributes: {
        id: {
          validate: (value: string): boolean => {
            expect(value).toBe(id)
            return 2 < value.length
          },
        },

        correlationId: {
          validate: (value: string): boolean => {
            expect(value).toBe(correlationId)
            return 2 < value.length
          },
        },

        createdAt: {
          validate: (value: Date): boolean => {
            expect(value).toBe(createdAt)
            return guard<Date>(value)
          },
        },

        entity: {
          validate: (value: User): boolean => {
            expect(guard<User>(value)).toBeTruthy()
            return guard<User>(value)
          },
        },
      },
    })

    const e1 = createEvent({
      id,
      correlationId,
      createdAt,
      entity,
    })

    expect(e1.id).toBe(id)
    expect(e1.correlationId).toBe(correlationId)
    expect(e1.createdAt).toBe(createdAt)
    expect(e1.entity).toStrictEqual(entity)
  })
})
