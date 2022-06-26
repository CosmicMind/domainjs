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
 * @module Value
 */

import {
  clone,
  guardFor,
  FoundationError,
} from '@cosmicverse/foundation'

export interface Value<T> {
  readonly value: T
}

export type ValueType<V> = V extends Value<infer T> ? T : V

export type ValuePropertyKey<T> = keyof T extends string | symbol ? keyof T : never

export type ValueConstructor<V extends Value<unknown>> = new (value: ValueType<V>) => V

export type ValueLifecycleHooks<T> = {
  trace?(target: T): void
  validate?(value: ValueType<T>, state: T): boolean | never
  created?(target: T): void
}

/**
 * The `ValueError`.
 */
export class ValueError extends FoundationError {}

/**
 * The `createValueHandler` prepares the `ValueLifecycleHooks` for
 * the given `handler`.
 */
export function createValueHandler<T extends Value<unknown>, V extends ValueType<T> = ValueType<T>>(target: T, handler: ValueLifecycleHooks<T>): ProxyHandler<T> {
  const state = clone(target) as Readonly<T>

  return {
    /**
     * The `set` updates the given property with the given value..
     */
    set(target: T, prop: 'value', value: V): boolean | never {
      if (guardFor(handler, 'validate')) {
        if (!handler.validate?.(value, state)) {
          throw new ValueError(`${String(prop)} is invalid`)
        }
      }
      return Reflect.set(target, prop, value)
    },

    deleteProperty(target: T, prop: string | number | symbol): boolean | never {
      if ('value' === prop) {
        throw new ValueError(`value cannot be deleted`)
      }
      return Reflect.deleteProperty(target, prop)
    },
  }
}

/**
 * The `createValueProxy` creates a new `Proxy` instance with the
 * given `target` and `handler`.
 */
export const createValueProxy = <T extends Value<unknown>>(target: T, handler: ValueLifecycleHooks<T> = {}): T | never => {
  if (guardFor(target, 'value')) {
    if (guardFor(handler, 'validate', 'updated')) {
      if (!handler.validate?.(target.value as ValueType<T>, {} as Readonly<T>)) {
        throw new ValueError(`value: ${String(target.value)} is invalid`)
      }
    }

    const state = clone(target) as Readonly<T>
    handler.created?.(state)
    handler.trace?.(state)
  }

  return new Proxy(target, createValueHandler(target, handler))
}

export function defineValue<V extends Value<unknown>>(_class: ValueConstructor<V>, handler: ValueLifecycleHooks<V> = {}): (value: ValueType<V>) => V {
  return (value: ValueType<V>): V => createValueProxy(new _class(value), handler)
}
