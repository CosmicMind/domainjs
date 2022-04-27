/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2022, Cosmicverse
 * All rights reserved.
 *
 * Author: Daniel Jonathan <daniel@cosmicverse.org>
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
 * @module Aggregate
 */

import {
  Optional,
  Serializable,
} from '@cosmicverse/foundation'

import {
  Entity,
  EntityType,
  EntityId,
  EntityDate,
} from '@/Entity'

/**
 * @template TAggregate
 *
 * The `AggregateCreateFn` is a type definition that is used
 * to generate new `Aggregate` instances from a given
 * constructor function.
 *
 * @type {(...args: any[]) => TAggregate}
 */
export interface AggregateCreateFn<TAggregate extends Aggregate> {
  (root: Entity): TAggregate
}

/**
 * The `IAggregate` defines the base `Aggregate` properties.
 *
 * @property {EntityType} type
 * @property {EntityId} id
 * @property {EntityDate} created
 */
export interface IAggregate extends Serializable {
  get type(): Readonly<EntityType>
  get id(): Readonly<EntityId>
  get created(): Readonly<EntityDate>
}

/**
 * @template TEntity
 * @implements {IAggregate}
 *
 * The `Aggregate` class is the base structure used to
 * generate domain aggregates.
 */
export class Aggregate<TEntity extends Entity = Entity> implements IAggregate {
  /**
   * @private
   *
   * A reference to the root `Entity` instance.
   *
   * @type {TEntity}
   */
  readonly #root: TEntity

  /**
   * A reference to the root `Entity` type.
   *
   * @type {EntityType}
   */
  get type(): Readonly<EntityType> {
    return this.#root.type
  }

  /**
   * A reference to the root `Entity` type.
   *
   * @type {EntityType}
   */
  get id(): Readonly<EntityId> {
    return this.#root.id
  }

  /**
   * A reference to the root `Entity` type.
   *
   * @type {EntityType}
   */
  get created(): Readonly<EntityDate> {
    return this.#root.created
  }

  /**
   * @constructor
   *
   * @param {TEntity} root
   */
  constructor(root: TEntity) {
    this.#root = root
  }
}

/**
 * The `createAggregate` is used to generate a new `Aggregate`
 * instance.
 *
 * @returns {AggregateCreateFn<Aggregate>}
 */
export const createAggregate = (): AggregateCreateFn<Aggregate> =>
  createAggregateFor(Aggregate)

/**
 * @template TAggregate
 *
 * The `createAggregateFor` is used to generate a new `Aggregate`
 * instance from a given `class` constructor.
 *
 * @param {{ new (root: Entity): TAggregate  }} _class
 * @returns {AggregateCreateFn<TAggregate>}
 */
export const createAggregateFor = <TAggregate extends Aggregate>(_class: { new (root: Entity): TAggregate }): AggregateCreateFn<TAggregate> =>
  (root: Entity): TAggregate => new _class(root)

/**
 * The `validateAggregateFor` is ued to validate a given `Aggregate`.
 *
 * @param {Aggregate} aggregate
 * @param {any} [_class = Aggregate]
 * @returns {boolean}
 */
export const validateAggregateFor = (aggregate: Aggregate, _class: Optional<unknown> = Aggregate): boolean => aggregate instanceof _class