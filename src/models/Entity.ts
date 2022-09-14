// Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved.

/**
 * @module Entity
 */

import {
  clone,
  guardFor,
  FoundationError,
} from '@cosmicverse/foundation'

export type Entity = Record<string, unknown>

/**
 * The `EntityPropertyKey` defines the allowable keys for
 * a given type `T`.
 */
export type EntityPropertyKey<T> = keyof T extends string | symbol ? keyof T : never

export type EntityPropertyLifecycle<T, V> = {
  validate?(value: Readonly<V>, state: Readonly<T>): boolean | never
  updated?(newValue: Readonly<V>, oldValue: Readonly<V>, state: Readonly<T>): void
  deleted?(value: Readonly<V>, state: Readonly<T>): void
}

/**
 * The `EntityPropertyLifecycleMap` defined the key-value
 * pairs used in handling property events.
 */
export type EntityPropertyLifecycleMap<T> = {
  [P in keyof T]?: EntityPropertyLifecycle<T, T[P]>
}

export type EntityLifecycle<T> = {
  trace?(target: Readonly<T>): void
  created?(target: Readonly<T>): void
  updated?(newTarget: Readonly<T>, oldTarget: Readonly<T>): void
  properties?: EntityPropertyLifecycleMap<T>
}

/**
 * The `EntityError`.
 */
export class EntityError extends FoundationError {}

export const defineEntity = <E extends Entity>(handler: EntityLifecycle<E> = {}): (entity: E) => E =>
  (entity: E): E => createEntity(entity, handler)

/**
 * The `createEntityHandler` prepares the `EntityLifecycle` for
 * the given `handler`.
 */
function createEntityHandler<T extends object>(target: T, handler: EntityLifecycle<T>): ProxyHandler<T> {
  let state = clone(target) as Readonly<T>

  return {
    /**
     * The `set` updates the given property with the given value.
     */
    set<P extends EntityPropertyKey<T>, V extends T[P]>(target: T, prop: P, value: V): boolean | never {
      const h = handler.properties?.[prop]

      if (false === h?.validate?.(value, state)) {
        throw new EntityError(`${String(prop)} is invalid`)
      }

      const oldValue = target[prop]
      const oldTarget = state
      const ret = Reflect.set(target, prop, value)

      state = clone(target) as Readonly<T>

      h?.updated?.(value, oldValue, state)

      handler.updated?.(state, oldTarget)
      handler.trace?.(state)

      return ret
    },
  }
}

/**
 * The `createEntity` creates a new `Proxy` instance with the
 * given `target` and `handler`.
 */
function createEntity<T extends object>(target: T, handler: EntityLifecycle<T> = {}): T | never {
  if (guardFor(target)) {
    const properties = handler.properties

    if (guardFor(properties)) {
      for (const prop in properties) {
        if (false === properties[prop]?.validate?.(target[prop], {} as Readonly<T>)) {
          throw new EntityError(`${String(prop)} is invalid`)
        }
      }
    }

    const state = clone(target) as Readonly<T>
    handler.created?.(state)
    handler.trace?.(state)
  }

  return new Proxy(target, createEntityHandler(target, handler))
}