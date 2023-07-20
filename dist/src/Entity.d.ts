import { FoundationError } from '@cosmicmind/foundationjs';
export type Entity = object;
export type EntityAttributeKey<K> = keyof K extends string | symbol ? keyof K : never;
export type EntityAttributeLifecycle<E extends Entity, V> = {
    validate?(value: V, entity: E): boolean | never;
    updated?(newValue: V, oldValue: V, entity: E): void;
};
export type EntityAttributeLifecycleMap<E extends Entity> = {
    [K in keyof E]?: EntityAttributeLifecycle<E, E[K]>;
};
export type EntityLifecycle<E extends Entity> = {
    created?(entity: E): void;
    trace?(entity: E): void;
    attributes?: EntityAttributeLifecycleMap<E>;
};
export declare class EntityError extends FoundationError {
}
export declare const defineEntity: <E extends object>(handler?: EntityLifecycle<E>) => (entity: E) => E;
