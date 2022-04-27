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
 * @module Repository
 */

/**
 * @template TRepository
 *
 * The `RepositoryCreateFn` is a type definition that is used
 * to generate new `Repository` instances from a given
 * constructor function.
 *
 * @type {(...args: any[]) => TRepository}
 */
export interface RepositoryCreateFn<TRepository extends Repository> {
  (...args: unknown[]): TRepository
}

/**
 * The `IRepository` defines the base `Repository` properties.
 *
 * @property {EntityType} type
 * @property {EntityId} id
 * @property {EntityDate} created
 */
export interface IRepository {
  get name(): Readonly<string>
}

/**
 * @implements {IRepository}
 *
 * The `Repository` class is the base structure used to
 * generate domain aggregates.
 */
export class Repository implements IRepository {
  get name(): Readonly<string> {
    return this.constructor.name
  }
}

/**
 * The `createRepository` is used to generate a new `Repository`
 * instance.
 *
 * @returns {RepositoryCreateFn<Repository>}
 */
export const createRepository = (): RepositoryCreateFn<Repository> =>
  createRepositoryFor(Repository)

/**
 * @template TRepository
 *
 * The `createRepositoryFor` is used to generate a new `Repository`
 * instance from a given `class` constructor.
 *
 * @param {{ new (...args: any[]): TRepository }} _class
 * @returns {RepositoryCreateFn<TRepository>}
 */
export const createRepositoryFor = <TRepository extends Repository>(_class: { new (...args: unknown[]): TRepository }): RepositoryCreateFn<TRepository> =>
  (...args: unknown[]): TRepository => new _class(...args)