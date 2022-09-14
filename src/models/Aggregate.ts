// Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved.

/**
 * @module Aggregate
 */

import {
  Entity,
  EntityLifecycle,
  defineEntity,
} from './Entity'

import {
  EventTopics,
  EventObservable,
} from './Event'

const sentinel: EventTopics = {}

export abstract class Aggregate<E extends Entity, T extends EventTopics = typeof sentinel> extends EventObservable<T> {
  protected root: E

  protected constructor(root: E) {
    super()
    this.root = root
  }
}

export type AggregateTypeFor<A> = A extends Aggregate<infer E> ? E : A

export type AggregateConstructor<A extends Aggregate<Entity>> = new (root: AggregateTypeFor<A>) => A

export function defineAggregate<A extends Aggregate<Entity>>(_class: AggregateConstructor<A>, handler: EntityLifecycle<AggregateTypeFor<A>> = {}): (root: AggregateTypeFor<A>) => A {
  const createEntity = defineEntity<AggregateTypeFor<A>>(handler)
  return (root: AggregateTypeFor<A>): A => new _class(createEntity(root))
}
