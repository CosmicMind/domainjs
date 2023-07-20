import { FoundationError } from '@cosmicmind/foundationjs';
import { Observable, ObservableTopics } from '@cosmicmind/patternjs';
export type Event = object;
export type EventTopics = ObservableTopics & {
    readonly [K: string]: Event;
};
export type EventFn<E extends Event> = (event: E) => void;
export declare class EventObservable<T extends EventTopics> extends Observable<T> {
}
export type EventAttributeKey<K> = keyof K extends string | symbol ? keyof K : never;
export type EventAttributeLifecycle<E, V> = {
    validate?(value: V, event: E): boolean | never;
};
export type EventAttributeLifecycleMap<E> = {
    [K in keyof E]?: EventAttributeLifecycle<E, E[K]>;
};
export type EventLifecycle<E> = {
    created?(event: E): void;
    trace?(event: E): void;
    attributes?: EventAttributeLifecycleMap<E>;
};
export declare class EventError extends FoundationError {
}
export declare const defineEvent: <E extends object>(handler?: EventLifecycle<E>) => (event: E) => E;
