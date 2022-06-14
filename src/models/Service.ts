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
 * @module Service
 */

import { Nameable } from '@cosmicverse/patterns'

import { Value } from './Value'

/**
 * Defines the `ServiceName` type.
 */
export type ServiceName = string

/**
 * The `IService` defines the base `Service` properties.
 */
export interface IService extends Nameable<ServiceName> {
  get name(): ServiceName
}

/**
 * The `Service` class is the base structure used to
 * generate domain services.
 */
export class Service<V extends Value> implements IService {
  /**
   * A reference to the options `Options` instance.
   */
  protected options: V

  /**
   * A reference to the `name` value.
   */
  get name(): ServiceName {
    return this.constructor.name
  }

  /**
   * @constructor
   */
  constructor(options: V) {
    this.options = options
  }
}

/**
 * A `constructor` type for `Service` types.
 */
export type ServiceConstructor<V extends Value, S extends Service<V>> = new (options: V) => S

/**
 * The `ServiceCreateFn` is a type definition that is used
 * to generate new `Service` instances from a given
 * constructor function.
 */
export type ServiceCreateFn<V extends Value, S extends Service<V>> = (options: V) => S

/**
 * The `createServiceFor` is used to generate a new `Service`
 * instance from a given `class` constructor.
 */
export const createServiceFor = <V extends Value, S extends Service<V>>(_class: ServiceConstructor<V, S>): ServiceCreateFn<V, S> =>
  (options: V): S => new _class(options)

/**
 * The `validateServiceFor` is ued to validate a given `Service`.
 */
export const validateServiceFor = <V extends Value, S extends Service<V>>(service: S, _class: ServiceConstructor<V, S>): boolean => service instanceof _class
