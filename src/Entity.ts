/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

/**
 * @module Entity
 */

import {
  guardFor,
  FoundationError,
} from '@cosmicmind/foundationjs'

export type Entity = Record<string, unknown>

/**
 * The `EntityAttributeKey` defines the allowable keys for
 * a given type `K`.
 */
export type EntityAttributeKey<K> = keyof K extends string | symbol ? keyof K : never

export type EntityAttributeLifecycle<E, V> = {
  validate?(value: V, entity: E): boolean | never
  updated?(newValue: V, oldValue: V, entity: E): void
}

/**
 * The `EntityAttributeLifecycleMap` defined the key-value
 * pairs used in handling attribute events.
 */
export type EntityAttributeLifecycleMap<E> = {
  [K in keyof E]?: EntityAttributeLifecycle<E, E[K]>
}

export type EntityLifecycle<E> = {
  trace?(entity: E): void
  createdAt?(entity: E): void
  attributes?: EntityAttributeLifecycleMap<E>
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
function createEntityHandler<E extends Entity>(handler: EntityLifecycle<E>): ProxyHandler<E> {
  return {
    /**
     * The `set` updates the given attribute with the given value.
     */
    set<A extends EntityAttributeKey<E>, V extends E[A]>(target: E, attr: A, value: V): boolean | never {
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
function createEntity<E extends Entity>(target: E, handler: EntityLifecycle<E> = {}): E | never {
  if (guardFor(target)) {
    const { attributes } = handler
    const entity = new Proxy(target, createEntityHandler(handler))

    if (guardFor(attributes)) {
      for (const attr in attributes) {
        if (false === attributes[attr]?.validate?.(target[attr], entity)) {
          throw new EntityError(`${String(attr)} is invalid`)
        }
      }

      handler.createdAt?.(entity)
      handler.trace?.(entity)
      return entity
    }
  }

  throw new EntityError('Unable to create Entity')
}