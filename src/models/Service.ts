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

/**
 * @template TService
 *
 * The `ServiceCreateFn` is a type definition that is used
 * to generate new `Service` instances from a given
 * constructor function.
 *
 * @type {() => TService}
 */
export type ServiceCreateFn<TService extends Service> = () => TService

/**
 * The `IService` defines the base `Service` properties.
 *
 * @property {EntityType} type
 * @property {EntityId} id
 * @property {EntityDate} created
 */
export interface IService {
  get name(): string
}

/**
 * @implements {IService}
 *
 * The `Service` class is the base structure used to
 * generate domain aggregates.
 */
export class Service implements IService {
  get name(): string {
    return this.constructor.name
  }
}

/**
 * The `createService` is used to generate a new `Service`
 * instance.
 *
 * @returns {ServiceCreateFn<Service>}
 */
export const createService = (): ServiceCreateFn<Service> =>
  createServiceFor(Service)

/**
 * @template TService
 *
 * The `createServiceFor` is used to generate a new `Service`
 * instance from a given `class` constructor.
 *
 * @param {{ new (): TService }} _class
 * @returns {ServiceCreateFn<TService>}
 */
export const createServiceFor = <TService extends Service>(_class: { new (): TService }): ServiceCreateFn<TService> =>
  (): TService => new _class()
