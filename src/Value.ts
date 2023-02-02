/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

/**
 * @module Value
 */

import {
clone,
guardFor,
FoundationError
} from '@cosmicmind/foundationjs'

export abstract class Value<V> {
  private _value: V

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
  validate?(value: ValueTypeFor<T>, state: T): boolean | never
  createdAt?(target: T): void
}

/**
 * The `ValueError`.
 */
export class ValueError extends FoundationError {}

/**
 * The `defineValue` sets a new ValueLifecycle to the given `Value`.
 */
export const defineValue = <V extends Value<unknown>>(_class: ValueConstructor<V>, handler: ValueLifecycle<V> = {}): (value: ValueTypeFor<V>) => V =>
  (value: ValueTypeFor<V>): V => createValue(new _class(value), handler)


/**
 * The `createValueHandler` prepares the `ValueLifecycle` for
 * the given `handler`.
 */
function createValueHandler<T extends Value<unknown>, V extends ValueTypeFor<T> = ValueTypeFor<T>>(target: T, handler: ValueLifecycle<T>): ProxyHandler<T> {
  const state = clone(target) as Readonly<T>

  return {
    /**
     * The `set` updates the given attribute with the given value.
     */
    set(target: T, attr: 'value', value: V): boolean | never {
      if (false === handler.validate?.(value, state)) {
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
function createValue<T extends Value<unknown>>(target: T, handler: ValueLifecycle<T> = {}): T | never {
  if (guardFor(target)) {
    if (false === handler.validate?.(target.value as ValueTypeFor<T>, {} as Readonly<T>)) {
      throw new ValueError(`value is invalid`)
    }

    const state = clone(target) as Readonly<T>
    handler.createdAt?.(state)
    handler.trace?.(state)
  }

  return new Proxy(target, createValueHandler(target, handler))
}