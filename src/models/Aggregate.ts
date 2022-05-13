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
 * @module Aggregate
 */

import {
  Newable,
  Serializable,
} from '@cosmicverse/foundation'

import {
  Entity,
  EntityType,
  EntityId,
  EntityDate,
} from './Entity'

/**
 * @template TAggregate
 *
 * The `AggregateCreateFn` is a type definition that is used
 * to generate new `Aggregate` instances from a given
 * constructor function.
 *
 * @type {(root: TEntity)) => TAggregate}
 */
export type AggregateCreateFn<TEntity extends Entity, TAggregate extends Aggregate<TEntity>> = (root: TEntity) => TAggregate

/**
 * The `IAggregate` defines the base `Aggregate` properties.
 *
 * @property {EntityType} type
 * @property {EntityId} id
 * @property {EntityDate} created
 */
export interface IAggregate extends Serializable {
  get type(): EntityType
  get id(): EntityId
  get created(): EntityDate
}

/**
 * @template TEntity
 * @implements {IAggregate<TEntity>}
 *
 * The `Aggregate` class is the base structure used to
 * generate domain aggregates.
 */
export class Aggregate<TEntity extends Entity> implements IAggregate {
  /**
   * @template TEntity
   * @protected
   *
   * A reference to the root `Entity` instance.
   *
   * @type {TEntity}
   */
  protected root: TEntity

  /**
   * A reference to the root `Entity` type.
   *
   * @type {EntityType}
   */
  get type(): EntityType {
    return this.root.type
  }

  /**
   * A reference to the root `Entity` type.
   *
   * @type {EntityType}
   */
  get id(): EntityId {
    return this.root.id
  }

  /**
   * A reference to the root `Entity` type.
   *
   * @type {EntityType}
   */
  get created(): EntityDate {
    return this.root.created
  }

  /**
   * A `serialized` representation of the
   * root `Entity`.
   *
   * @type {string}
   */
  get serialized(): string {
    return this.root.serialized
  }

  /**
   * @constructor
   *
   * @param {TEntity} root
   */
  constructor(root: TEntity) {
    this.root = root
  }
}

/**
 * @template TAggregate
 *
 * The `createAggregateFor` is used to generate a new `Aggregate`
 * instance from a given `class` constructor.
 *
 * @param {{ new (root: TEntity): TAggregate  }} _class
 * @returns {AggregateCreateFn<TAggregate>}
 */
export const createAggregateFor = <TEntity extends Entity, TAggregate extends Aggregate<TEntity>>(_class: Newable<TAggregate>): AggregateCreateFn<TEntity, TAggregate> =>
  (root: TEntity): TAggregate => new _class(root)

/**
 * @template TAggregate
 *
 * The `validateAggregateFor` is ued to validate a given `Aggregate`.
 *
 * @param {TAggregate} aggregate
 * @param {Newable<TAggregate>} _class
 * @returns {boolean}
 */
export const validateAggregateFor = <TEntity extends Entity, TAggregate extends Aggregate<TEntity>>(aggregate: TAggregate, _class: Newable<TAggregate>): boolean => aggregate instanceof _class
