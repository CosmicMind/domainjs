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
 * @module Aggregate
 */

import {
  Identifiable,
  Typeable,
  Serializable,
} from '@cosmicverse/patterns'

import {
  Entity,
  EntityType,
  EntityId,
  EntityDate,
} from './Entity'

/**
 * The `IAggregate` defines the base `Aggregate` properties.
 */
export interface IAggregate extends Typeable<EntityType>, Identifiable<EntityId>, Serializable {
  get type(): EntityType

  get id(): EntityId

  get created(): EntityDate
}

/**
 * @template E
 * @implements {IAggregate}
 *
 * The `Aggregate` class is the base structure used to
 * generate domain aggregates.
 */
export class Aggregate<E extends Entity> implements IAggregate {
  /**
   * A reference to the root `Entity` instance.
   */
  protected root: E

  /**
   * A reference to the root `Entity` type.
   */
  get type(): EntityType {
    return this.root.type
  }

  /**
   * A reference to the root `Entity` type.
   */
  get id(): EntityId {
    return this.root.id
  }

  /**
   * A reference to the root `Entity` type.
   */
  get created(): EntityDate {
    return this.root.created
  }

  /**
   * A `serialized` representation of the
   * root `Entity`.
   */
  get serialized(): string {
    return this.root.serialized
  }

  /**
   * @constructor
   */
  constructor(root: E) {
    this.root = root
  }
}

/**
 * A `constructor` type for `Aggregate` types.
 */
export type AggregateConstructor<E extends Entity, A extends Aggregate<E>> = new (root: E) => A

/**
 * @template A
 *
 * The `AggregateCreateFn` is a type definition that is used
 * to generate new `Aggregate` instances from a given
 * constructor function.
 */
export type AggregateCreateFn<E extends Entity, A extends Aggregate<E>> = (root: E) => A

/**
 * The `createAggregateFor` is used to generate a new `Aggregate`
 * instance from a given `class` constructor.
 */
export const createAggregateFor = <E extends Entity, A extends Aggregate<E>>(_class: AggregateConstructor<E, A>): AggregateCreateFn<E, A> =>
  (root: E): A => new _class(root)

/**
 * The `validateAggregateFor` is ued to validate a given `Aggregate`.
 */
export const validateAggregateFor = <E extends Entity, A extends Aggregate<E>>(aggregate: A, _class: AggregateConstructor<E, A>): boolean => aggregate instanceof _class
