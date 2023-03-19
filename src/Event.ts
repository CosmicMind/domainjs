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

/**
 * @module Event
 */

import {
  guard,
  FoundationError,
} from '@cosmicmind/foundationjs'

import {
  Observable,
  ObservableTopics,
} from '@cosmicmind/patternjs'

export type Event = object

export type EventTopics = ObservableTopics & {
  readonly [K: string]: Event
}

export type EventFn<E extends Event> = (event: E) => void

export class EventObservable<T extends EventTopics> extends Observable<T> {}

/**
 * The `EventAttributeKey` defines the allowable keys for
 * a given type `K`.
 */
export type EventAttributeKey<K> = keyof K extends string | symbol ? keyof K : never

export type EventAttributeLifecycle<E, V> = {
  validate?(value: V, event: E): boolean | never
}

/**
 * The `EventAttributeLifecycleMap` defined the key-value
 * pairs used in handling attribute events.
 */
export type EventAttributeLifecycleMap<E> = {
  [K in keyof E]?: EventAttributeLifecycle<E, E[K]>
}

export type EventLifecycle<E> = {
  trace?(event: E): void
  createdAt?(event: E): void
  attributes?: EventAttributeLifecycleMap<E>
}

/**
 * The `EventError`.
 */
export class EventError extends FoundationError {}

export const defineEvent = <E extends Event>(handler: EventLifecycle<E> = {}): (event: E) => E =>
  (event: E) => createEvent(event, handler)

/**
 * The `createEventHandler` prepares the `EventLifecycle` for
 * the given `handler`.
 */
function createEventHandler<E extends Event>(handler: EventLifecycle<E>): ProxyHandler<E> {
  return {
    set<A extends EventAttributeKey<E>, V extends E[A]>(target: E, attr: A, value: V): boolean | never {
      const h = handler.attributes?.[attr]
      if (false === h?.validate?.(value, target)) {
        throw new EventError(`${String(attr)} is invalid`)
      }

      const result = Reflect.set(target, attr, value)
      handler.trace?.(target)
      return result
    },
  }
}

/**
 * The `createEvent` creates a new `Proxy` instance with the
 * given `target` and `handler`.
 */
function createEvent<E extends Event>(target: E, handler: EventLifecycle<E> = {}): E | never {
  if (guard<E>(target)) {
    const { attributes } = handler
    const event = new Proxy(target, createEventHandler(handler))

    if (guard<EventAttributeLifecycleMap<E>>(attributes)) {
      for (const attr in attributes) {
        if (false === attributes[attr]?.validate?.(target[attr], event)) {
          throw new EventError(`${String(attr)} is invalid`)
        }
      }

      handler.createdAt?.(event)
      handler.trace?.(event)
      return event
    }
  }

  throw new EventError('Unable to create Event')
}