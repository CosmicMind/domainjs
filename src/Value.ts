/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

/**
 * @module Value
 */

import {
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

export type ValueLifecycle<T> = {
  trace?(target: T): void
  validate?(value: ValueTypeFor<T>, state?: ValueTypeFor<T>): boolean | never
  createdAt?(target: T): void
}

/**
 * The `ValueError`.
 */
export class ValueError extends FoundationError {}

/**
 * The `defineValue` sets a new ValueLifecycle to the given `Value`.
 */
export const defineValue = <V extends Value<ValueTypeFor<V>>>(_class: ValueConstructor<V>, handler: ValueLifecycle<V> = {}): (value: ValueTypeFor<V>) => V =>
  (value: ValueTypeFor<V>): V => createValue(new _class(value), handler)


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
      if (false === handler.validate?.(value, target[attr])) {
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
function createValue<V extends Value<ValueTypeFor<V>>>(target: V, handler: ValueLifecycle<V> = {}): V | never {
  if (false === handler.validate?.(target.value)) {
    throw new ValueError(`value is invalid`)
  }
  const p = new Proxy(target, createValueHandler(handler))
  handler.createdAt?.(p)
  handler.trace?.(p)
  return p
}