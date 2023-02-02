/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

/**
 * @module Entity
 */

import {
  assign,
  guardFor,
  FoundationError,
} from '@cosmicmind/foundationjs'

export type Entity = Record<string, unknown>

/**
 * The `EntityAttributeKey` defines the allowable keys for
 * a given type `T`.
 */
export type EntityAttributeKey<T> = keyof T extends string | symbol ? keyof T : never

export type EntityAttributeLifecycle<T, V> = {
  validate?(value: V, model: T): boolean | never
  updated?(newValue: V, oldValue: V, model: T): void
}

/**
 * The `EntityAttributeLifecycleMap` defined the key-value
 * pairs used in handling attribute events.
 */
export type EntityAttributeLifecycleMap<T> = {
  [P in keyof T]?: EntityAttributeLifecycle<T, T[P]>
}

export type EntityLifecycle<T> = {
  trace?(target: T): void
  createdAt?(target: T): void
  attributes?: EntityAttributeLifecycleMap<T>
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
function createEntityHandler<T extends object>(handler: EntityLifecycle<T>): ProxyHandler<T> {
  return {
    /**
     * The `set` updates the given attribute with the given value.
     */
    set<A extends EntityAttributeKey<T>, V extends T[A]>(target: T, attr: A, value: V): boolean | never {
      const h = handler.attributes?.[attr]

      if (false === h?.validate?.(value, target)) {
        throw new EntityError(`${String(attr)} is invalid`)
      }

      const oldValue = target[attr]
      h?.updated?.(value, oldValue, target)

      const result = Reflect.set(target, attr, value)
      handler.trace?.(target)

      return result
    },
  }
}

/**
 * The `createEntity` creates a new `Proxy` instance with the
 * given `target` and `handler`.
 */
function createEntity<T extends object>(target: T, handler: EntityLifecycle<T> = {}): T | never {
  const { attributes } = handler
  if (guardFor(attributes)) {
    for (const attr in attributes) {
      if (false === attributes[attr]?.validate?.(target[attr], {} as Readonly<T>)) {
        throw new EntityError(`${String(attr)} is invalid`)
      }
    }
  }
  const p = new Proxy(target, createEntityHandler(handler))
  const model = assign({}, target) as T
  handler.createdAt?.(model)
  handler.trace?.(model)
  return p
}