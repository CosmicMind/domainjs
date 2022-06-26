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

/**
 * Infers the given type `T` for `Value<T>`.
 */
export type ValueType<V> = V extends Value<infer T> ? T : V

/**
 * The constructor that the `defineValue` is willing to accept
 * as an implemented `Value<T>`.
 */
export type ValueConstructor<V extends Value<unknown>> = new (value: ValueType<V>) => V

export type ValueLifecycle<T> = {
  trace?(target: T): void
  validate?(value: ValueType<T>, state: T): boolean | never
  created?(target: T): void
}

/**
 * The `ValueError`.
 */
export class ValueError extends FoundationError {}

/**
 * The `createValueHandler` prepares the `ValueLifecycle` for
 * the given `handler`.
 */
export function createValueHandler<T extends Value<unknown>, V extends ValueType<T> = ValueType<T>>(target: T, handler: ValueLifecycle<T>): ProxyHandler<T> {
  const state = clone(target) as Readonly<T>

  return {
    /**
     * The `set` updates the given property with the given value.
     */
    set(target: T, prop: 'value', value: V): boolean | never {
      if (guardFor(handler, 'validate')) {
        if (!handler.validate?.(value, state)) {
          throw new ValueError(`${String(prop)} is invalid`)
        }
      }
      return Reflect.set(target, prop, value)
    },
  }
}

/**
 * The `createValueProxy` creates a new `Proxy` instance with the
 * given `target` and `handler`.
 */
export const createValueProxy = <T extends Value<unknown>>(target: T, handler: ValueLifecycle<T> = {}): T | never => {
  if (false === handler.validate?.(target.value as ValueType<T>, {} as Readonly<T>)) {
    throw new ValueError(`value: ${String(target.value)} is invalid`)
  }

  const state = clone(target) as Readonly<T>
  handler.created?.(state)
  handler.trace?.(state)

  return new Proxy(target, createValueHandler(target, handler))
}

/**
 * The `defineValue` sets a new ValueLifecycle to the given `Value`.
 */
export function defineValue<V extends Value<unknown>>(_class: ValueConstructor<V>, handler: ValueLifecycle<V> = {}): (value: ValueType<V>) => V {
  return (value: ValueType<V>): V => createValueProxy(new _class(value), handler)
}
