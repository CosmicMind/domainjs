/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2022, Daniel Jonathan <daniel at cosmicverse dot com>
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

import { Newable } from '@cosmicverse/foundation'

export type Options = object

/**
 * @template TService
 *
 * The `ServiceCreateFn` is a type definition that is used
 * to generate new `Service` instances from a given
 * constructor function.
 *
 * @type {(options: TOptions)) => TService}
 */
export type ServiceCreateFn<TOptions extends Options, TService extends Service<TOptions>> = (options: TOptions) => TService

/**
 * The `IService` defines the base `Service` properties.
 */
export interface IService {
  get name(): string
}

/**
 * @template TOptions
 * @implements {IService}
 *
 * The `Service` class is the base structure used to
 * generate domain services.
 */
export class Service<TOptions extends Options> implements IService {
  /**
   * @template TOptions
   * @protected
   *
   * A reference to the options `Options` instance.
   *
   * @type {TOptions}
   */
  protected options: TOptions

  get name(): string {
    return this.constructor.name
  }

  /**
   * @constructor
   *
   * @param {TOptions} options
   */
  constructor(options: TOptions) {
    this.options = options
  }
}

/**
 * @template TService
 *
 * The `createServiceFor` is used to generate a new `Service`
 * instance from a given `class` constructor.
 *
 * @param {Newable<TService>} _class
 * @returns {ServiceCreateFn<TService>}
 */
export const createServiceFor = <TOptions extends Options, TService extends Service<TOptions>>(_class: Newable<TService>): ServiceCreateFn<TOptions, TService> =>
  (options: TOptions): TService => new _class(options)

/**
 * @template TService
 *
 * The `validateServiceFor` is ued to validate a given `Service`.
 *
 * @param {TService} service
 * @param {Newable<TService>} _class
 * @returns {boolean}
 */
export const validateServiceFor = <TOptions extends Options, TService extends Service<TOptions>>(service: TService, _class: Newable<TService>): boolean => service instanceof _class
