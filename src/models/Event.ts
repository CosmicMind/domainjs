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

/**
 * @module Event
 */

import {
  clone,
  guardFor,
  FoundationError,
} from '@cosmicmind/lib-foundation'

import {
  Observable,
  ObservableTopics,
} from '@cosmicmind/lib-patterns'

export type Event<T> = {
  readonly id: string
  readonly correlationId: string
  readonly created: Date
  readonly message: T
}

export type EventTopics = ObservableTopics & {
  readonly [K: string]: Event<unknown>
}

export type EventTypeFor<E> = E extends Event<infer T> ? T : E

export type EventFn<E extends Event<unknown>> = (event: E) => void

export abstract class EventObservable<T extends EventTopics> extends Observable<T> {}

/**
 * The `EventPropertyKey` defines the allowable keys for
 * a given type `T`.
 */
export type EventPropertyKey<T> = keyof T extends string | symbol ? keyof T : never

export type EventPropertyLifecycle<T, V> = {
  validate?(value: V, state: T): boolean | never
}

/**
 * The `EventPropertyLifecycleMap` defined the key-value
 * pairs used in handling property events.
 */
export type EventPropertyLifecycleMap<T> = {
  [P in keyof T]?: EventPropertyLifecycle<T, T[P]>
}

export type EventLifecycle<T> = {
  trace?(target: T): void
  created?(target: T): void
  properties?: EventPropertyLifecycleMap<T>
}

/**
 * The `EventError`.
 */
export class EventError extends FoundationError {}

export const defineEvent = <E extends Event<unknown>>(handler: EventLifecycle<E> = {}): (entity: E) => E =>
  (entity: E) => createEvent(entity, handler)

/**
 * The `createEventHandler` prepares the `EventLifecycle` for
 * the given `handler`.
 */
function createEventHandler<T extends object>(target: T, handler: EventLifecycle<T>): ProxyHandler<T> {
  let state = clone(target) as T

  return {
    /**
     * The `set` updates the given property with the given value.
     */
    set<P extends EventPropertyKey<T>, V extends T[P]>(target: T, prop: P, value: V): boolean | never {
      const h = handler.properties?.[prop]

      if (false === h?.validate?.(value, state)) {
        throw new EventError(`${String(prop)} is invalid`)
      }

      const ret = Reflect.set(target, prop, value)

      state = clone(target) as T
      handler.trace?.(state)

      return ret
    },
  }
}

/**
 * The `createEvent` creates a new `Proxy` instance with the
 * given `target` and `handler`.
 */
function createEvent<T extends object>(target: T, handler: EventLifecycle<T> = {}): T | never {
  if (guardFor(target)) {
    const properties = handler.properties

    if (guardFor(properties)) {
      for (const prop in properties) {
        if (false === properties[prop]?.validate?.(target[prop], {} as Readonly<T>)) {
          throw new EventError(`${String(prop)} is invalid`)
        }
      }
    }

    const state = clone(target) as Readonly<T>
    handler.created?.(state)
    handler.trace?.(state)
  }

  return new Proxy(target, createEventHandler(target, handler))
}