/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

/**
 * @module Value
 */

import {
  guardFor,
  FoundationError,
} from '@cosmicmind/foundationjs'

export abstract class Value<V> {
  private readonly _value: V

  get value(): V {
    return this._value
  }

  constructor(value: V) {
    this._value = value
  }
}

/**
 * Infers the given type `T` for `Value<T>`.
 */
export type ValueTypeFor<V> = V extends Value<infer T> ? T : V

/**
 * The constructor that the `defineValue` is willing to accept
 * as an implemented `Value<T>`.
 */
export type ValueConstructor<V extends Value<unknown>> = new (value: ValueTypeFor<V>) => V

export type ValueLifecycle<V> = {
  trace?(vo: V): void
  validate?(value: ValueTypeFor<V>, vo: V): boolean | never
  createdAt?(vo: V): void
}

/**
 * The `ValueError`.
 */
export class ValueError extends FoundationError {}

/**
 * The `defineValue` sets a new ValueLifecycle to the given `Value`.
 */
export const defineValue = <V extends Value<ValueTypeFor<V>>>(_class: ValueConstructor<V>, handler: ValueLifecycle<V> = {}): (value: ValueTypeFor<V>) => V =>
  (value: ValueTypeFor<V>): V => createValue(new _class(value), value, handler)

/**
 * The `createValueHandler` prepares the `ValueLifecycle` for
 * the given `handler`.
 */
function createValueHandler<V extends Value<ValueTypeFor<V>>, T extends ValueTypeFor<V> = ValueTypeFor<V>>(handler: ValueLifecycle<V>): ProxyHandler<V> {
  return {
    /**
     * The `set` updates the given attribute with the given value.
     */
    set(target: V, attr: 'value', value: T): boolean | never {
      if (false === handler.validate?.(value, target)) {
        throw new ValueError(`${String(attr)} is invalid`)
      }
      return Reflect.set(target, attr, value)
    },
  }
}

/**
 * The `createValue` creates a new `Proxy` instance with the
 * given `target` and `handler`.
 */
function createValue<V extends Value<ValueTypeFor<V>>>(target: V, value: ValueTypeFor<V>, handler: ValueLifecycle<V> = {}): V | never {
  if (guardFor(target)) {
    const vo = new Proxy(target, createValueHandler(handler))

    if (false === handler.validate?.(value, vo)) {
      throw new ValueError(`value is invalid`)
    }

    handler.createdAt?.(vo)
    handler.trace?.(vo)
    return vo
  }

  throw new ValueError('unable to create value')
}