/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

/**
 * @module Event
 */

import {
  clone,
  guardFor,
  FoundationError,
} from '@cosmicmind/foundation'

import {
  Observable,
  ObservableTopics,
} from '@cosmicmind/patterns'

export type Event<T> = {
  readonly id: string
  readonly correlationId: string
  readonly createdAt: Date
  readonly message: T
}

export type EventTopics = ObservableTopics & {
  readonly [K: string]: Event<unknown>
}

export type EventTypeFor<E> = E extends Event<infer T> ? T : E

export type EventFn<E extends Event<unknown>> = (event: E) => void

export abstract class EventObservable<T extends EventTopics> extends Observable<T> {}

/**
 * The `EventAttributeKey` defines the allowable keys for
 * a given type `T`.
 */
export type EventAttributeKey<T> = keyof T extends string | symbol ? keyof T : never

export type EventAttributeLifecycle<T, V> = {
  validate?(value: V, state: T): boolean | never
}

/**
 * The `EventAttributeLifecycleMap` defined the key-value
 * pairs used in handling attribute events.
 */
export type EventAttributeLifecycleMap<T> = {
  [P in keyof T]?: EventAttributeLifecycle<T, T[P]>
}

export type EventLifecycle<T> = {
  trace?(target: T): void
  createdAt?(target: T): void
  attributes?: EventAttributeLifecycleMap<T>
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
     * The `set` updates the given attribute with the given value.
     */
    set<A extends EventAttributeKey<T>, V extends T[A]>(target: T, attr: A, value: V): boolean | never {
      const h = handler.attributes?.[attr]

      if (false === h?.validate?.(value, state)) {
        throw new EventError(`${String(attr)} is invalid`)
      }

      const ret = Reflect.set(target, attr, value)

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
    const { attributes } = handler

    if (guardFor(attributes)) {
      for (const attr in attributes) {
        if (false === attributes[attr]?.validate?.(target[attr], {} as Readonly<T>)) {
          throw new EventError(`${String(attr)} is invalid`)
        }
      }
    }

    const state = clone(target) as Readonly<T>
    handler.createdAt?.(state)
    handler.trace?.(state)
  }

  return new Proxy(target, createEventHandler(target, handler))
}