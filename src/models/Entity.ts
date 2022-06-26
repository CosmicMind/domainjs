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

/**
 * @module Entity
 */

import {
  clone,
  guardFor,
  FoundationError,
} from '@cosmicverse/foundation'

export interface Entity {
  readonly id: string
  readonly created: Date
}

/**
 * The `ProxyPropertyKey` defines the allowable keys for
 * a given type `T`.
 */
export type ProxyPropertyKey<T> = keyof T extends string | symbol ? keyof T : never

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

/**
 * The `createEntityHandler` prepares the `EntityLifecycle` for
 * the given `handler`.
 */
export function createEntityHandler<T extends object>(target: T, handler: EntityLifecycle<T>): ProxyHandler<T> {
  let state = clone(target) as Readonly<T>

  return {
    /**
     * The `set` updates the given property with the given value.
     */
    set<P extends ProxyPropertyKey<T>, V extends T[P]>(target: T, prop: P, value: V): boolean | never {
      const h = handler.properties?.[prop]

      if (guardFor(h, 'validate', 'updated')) {
        if (!h.validate?.(value, state)) {
          throw new EntityError(`${String(prop)} is invalid`)
        }
      }

      if (guardFor(target, prop)) {
        const oldValue = target[prop]
        const oldTarget = state
        const ret = Reflect.set(target, prop, value)

        state = clone(target) as Readonly<T>

        h?.updated?.(value, oldValue, state)

        handler.updated?.(state, oldTarget)
        handler.trace?.(state)

        return ret
      }
      else {
        return false
      }
    },
  }
}

/**
 * The `createEntity` creates a new `Proxy` instance with the
 * given `target` and `handler`.
 */
export const createEntity = <T extends object>(target: T, handler: EntityLifecycle<T> = {}): T | never => {
  if (guardFor(target)) {
    const properties = handler.properties

    if (guardFor(properties)) {
      for (const prop in properties) {
        const h = properties[prop]
        if (guardFor(h, 'validate', 'updated')) {
          if (!properties[prop]?.validate?.(target[prop], {} as Readonly<T>)) {
            throw new EntityError(`${String(prop)} is invalid`)
          }
        }
      }
    }

    const state = clone(target) as Readonly<T>
    handler.created?.(state)
    handler.trace?.(state)
  }

  return new Proxy(target, createEntityHandler(target, handler))
}

export const defineEntity = <E extends Entity>(handler: EntityLifecycle<E> = {}): (entity: E) => E =>
  (entity: E) => createEntity(entity, handler)
