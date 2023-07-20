import { FoundationError } from '@cosmicmind/foundationjs';
export declare abstract class Value<V> {
    private readonly _value;
    get value(): V;
    constructor(value: V);
}
export type ValueTypeFor<V> = V extends Value<infer T> ? T : V;
export type ValueConstructor<V extends Value<unknown>> = new (value: ValueTypeFor<V>) => V;
export type ValueLifecycle<V> = {
    created?(vo: V): void;
    trace?(vo: V): void;
    validate?(value: ValueTypeFor<V>, vo: V): boolean | never;
};
export declare class ValueError extends FoundationError {
}
export declare const defineValue: <V extends Value<ValueTypeFor<V>>>(_class: ValueConstructor<V>, handler?: ValueLifecycle<V>) => (value: ValueTypeFor<V>) => V;
