/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

/**
 * @module Event
 */

import {
  guardFor,
  FoundationError,
} from '@cosmicmind/foundationjs'

import {
  Observable,
  ObservableTopics,
} from '@cosmicmind/patternjs'

export type Event = Record<string, unknown>

export type EventTopics = ObservableTopics & {
  readonly [K: string]: Event
}

export type EventFn<E extends Event> = (event: E) => void

export abstract class EventObservable<T extends EventTopics> extends Observable<T> {}

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
    /**
     * The `set` updates the given attribute with the given value.
     */
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
  if (guardFor(target)) {
    const { attributes } = handler
    const event = new Proxy(target, createEventHandler(handler))

    if (guardFor(attributes)) {
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