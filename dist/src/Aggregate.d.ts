import { Entity, EntityLifecycle } from './Entity';
import { EventTopics, EventObservable } from './Event';
export declare abstract class Aggregate<E extends Entity, T extends EventTopics = EventTopics> extends EventObservable<T> {
    protected root: E;
    constructor(root: E);
}
export type AggregateTypeFor<A> = A extends Aggregate<infer E> ? E : A;
export type AggregateConstructor<A extends Aggregate<Entity>> = new (root: AggregateTypeFor<A>) => A;
export declare function defineAggregate<A extends Aggregate<Entity>>(_class: AggregateConstructor<A>, handler?: EntityLifecycle<AggregateTypeFor<A>>): (root: AggregateTypeFor<A>) => A;
