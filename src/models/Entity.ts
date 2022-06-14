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
 * @module Entity
 */

import {
  date,
  string,
} from 'yup'

import {
  parse,
  stringify,
  Optional,
  ProxySchema,
  ProxyImmutable,
  ProxyMutable,
  ProxyVirtual,
  createProxyFor,
  FoundationError,
} from '@cosmicverse/foundation'

import {
  Identifiable,
  Typeable,
  Serializable,
} from '@cosmicverse/patterns'

import {
  Key,
  Value,
  Meta,
  Created,
} from '../utils/type-defs'

/**
 * @extends {FoundationError}
 *
 * The `EntityPropertyError` defines an error that arises when
 * a given property value doesn't pass validation checks
 * for a given property key.
 */
export class EntityPropertyError extends FoundationError {
}

/**
 * Defines the `EntityType` type.
 */
export type EntityType = string

/**
 * Defines the `EntityId` type.
 */
export type EntityId = string

/**
 * Defines the `EntityDate` type.
 */
export type EntityDate = Date

/**
 * Defines the `EntityDateSerialized` type.
 */
export type EntityDateSerialized = string

/**
 * Defines the `EntityPropertyValue` type.
 */
export type EntityPropertyValue = Optional<string | number | boolean | Date | Record<string, string | number> | (string | number)[] | Set<string | number> | object>

/**
 * The meta type definition for `EntityPropertyData`.
 * Each value is a flag that indicates if the value
 * stored is of that type. This is important after
 * objects have been serialized and transmitted, in
 * order to reconstruct the object with the correct
 * value types.
 */
export type EntityPropertyMeta = {
  boolean: boolean
  string: boolean
  number: boolean
  object: boolean
  date: boolean
  set: boolean
}

/**
 * Defines the `EntityPropertyDataKey` type.
 */
export type EntityPropertyDataKey = string

/**
 * Defines the `EntityPropertyDataValue` type.
 */
export type EntityPropertyDataValue = string | number | boolean

/**
 * Defines the `EntityPropertyDataMeta` type.
 */
export type EntityPropertyDataMeta = Partial<EntityPropertyMeta>

/**
 * Defines the `EntityPropertyData` type.
 */
export type EntityPropertyData =
  Key<EntityPropertyDataKey>
  & Value<EntityPropertyDataValue>
  & Meta<EntityPropertyDataMeta>

/**
 * Defines the `EntityProps` type.
 */
export type EntityProps = Identifiable<EntityId> & Created<EntityDate> & { [key: string]: EntityPropertyValue }

/**
 * The `EntityDataKeys` are used for checks or iterators
 * when processing `Entity` instances or `EntityData` values.
 */
export const EntityDataKeys = [ 'type', 'id', 'created', 'props' ]

/**
 * The `EntityProxySchema` extends `ProxySchema`.
 * This is done to organize the definitions within
 * modules.
 */
export interface EntityProxySchema extends ProxySchema {
  immutable: ProxyImmutable
  mutable: ProxyMutable
  virtual: ProxyVirtual
}

/**
 * The `IEntity` defines the base `Entity` properties.
 */
export interface IEntity extends Typeable<EntityType>, Identifiable<EntityId> {
  created: EntityDate
}

/**
 * The `EntityData` is used to recreate the instance after
 * being serialized.
 */
export type EntityData = Omit<IEntity, 'created'> & {
  created: EntityDateSerialized
  props: EntityPropertyData[]
}

/**
 * @implements {IEntity, Serializable}
 *
 * The `Entity` class is the base structure used to
 * generate domain entities.
 */
export class Entity implements IEntity, Serializable {
  /**
   * A reference to the `type` value.
   */
  readonly type: EntityType

  /**
   * A reference to the `id` value.
   */
  readonly id: EntityId

  /**
   * A reference to the `created` value.
   */
  readonly created: EntityDate

  /**
   * A reference to the property `key/value` pairs.
   */
  [key: string]: EntityPropertyValue

  /**
   * Converts the `Entity` to a serialized value.
   */
  get serialized(): string {
    return stringify(createEntityDataFor(this)) as string
  }

  /**
   * @constructor
   */
  constructor(type: EntityType, props: EntityProps) {
    this.id = props.id
    this.created = props.created

    Object.assign(this, props)
    this.type = type
  }
}

/**
 * A `constructor` type for `Entity` types.
 */
export type EntityConstructor<E extends Entity> = new (type: EntityType, props: EntityProps) => E

/**
 * The `EntityCreateFn` is a type definition that is used
 * to generate new `Entity` instances from a given
 * constructor function.
 */
export type EntityCreateFn<E extends Entity, EProps extends EntityProps = EntityProps> = (props: EProps) => E

export const EntityTypeErrorMessage = 'Entity type is invalid'
export const EntityTypeValidator = string().min(1).typeError(EntityTypeErrorMessage).defined().strict(true)

export const EntityIdErrorMessage = 'Entity id is invalid'
export const EntityIdValidator = string().uuid(EntityIdErrorMessage).defined().strict(true)

export const EntityCreatedErrorMessage = 'Entity created is invalid'
export const EntityCreatedValidator = date().typeError(EntityCreatedErrorMessage).defined().strict(true)

export const EntitySerializedErrorMessage = 'Entity serialized is invalid'
export const EntitySerializedValidator = string().min(1).typeError(EntitySerializedErrorMessage).defined().strict(true)

/**
 * The `createEntity` is used to generate a new `Entity` instance
 * from a given `type` and `schema`.
 */
export const createEntity = (type: EntityType, schema: Partial<EntityProxySchema> = {}): EntityCreateFn<Entity> =>
  (props: EntityProps): Entity => {
    if ('undefined' !== typeof props.type) {
      throw new EntityPropertyError('property (type) cannot be redefined')
    }

    const {
      immutable, mutable, virtual,
    } = schema

    return createProxyFor({
      immutable: {
        ...immutable,
        type: EntityTypeValidator,
        id: EntityIdValidator,
        created: EntityCreatedValidator,
        serialized: EntitySerializedValidator,
      },
      mutable,
      virtual,
    }, new Entity(type, props))
  }

/**
 * The `isEntityProperty` is used to check if a given property
 * is in the `EntityDataKeys` value. This is used to avoid
 * treating `key/value` pairs as `EntityDataKeys`.
 */
export const isEntityProperty = (key: string): boolean => EntityDataKeys.includes(key)

/**
 * The `generateEntityPropertyDataFor` is used to create an
 * array of `EntityPropertyData` literals. These are
 * when serializing `Entity` instances.
 */
export const generateEntityPropertyDataFor = (entity: Entity, fn: typeof isEntityProperty): EntityPropertyData[] => {
  const result: EntityPropertyData[] = []

  for (const [ key, v ] of Object.entries(entity)) {
    if (fn(key) || 'undefined' === typeof v) {
      continue
    }

    const meta: Partial<EntityPropertyMeta> = {}
    let value: EntityPropertyDataValue

    if ('boolean' === typeof v) {
      meta.boolean = true
      value = Boolean(v)
    }
    else if ('string' === typeof v) {
      meta.string = true
      value = v
    }
    else if ('number' === typeof v) {
      meta.number = true
      value = v
    }
    else if (v instanceof Date) {
      meta.date = true
      value = String(v)
    }
    else if (v instanceof Set) {
      meta.set = true
      value = stringify([ ...v.values() ]) as string
    }
    else if ('object' === typeof v) {
      meta.object = true
      value = stringify(v) as string
    }
    else {
      value = String(v)
    }

    result.push({
      key,
      value,
      meta,
    })
  }

  return result
}

/**
 * The `createEntityFor` is used to generate a new `Entity` instance
 * from a given `class` constructor, `type`, and `schema`.
 */
export const createEntityFor = <E extends Entity, EProps extends EntityProps = EntityProps>(_class: EntityConstructor<E>, schema: Partial<EntityProxySchema> = {}): EntityCreateFn<E, EProps> =>
  (props: EProps): E => {
    if ('undefined' !== typeof props.type) {
      throw new EntityPropertyError('property (type) cannot be redefined')
    }

    const {
      immutable,
      mutable,
      virtual,
    } = schema

    return createProxyFor({
      immutable: {
        ...immutable,
        type: EntityTypeValidator,
        id: EntityIdValidator,
        created: EntityCreatedValidator,
        serialized: EntitySerializedValidator,
      },
      mutable,
      virtual,
    }, new _class(_class.name, props))
  }

/**
 * The `createEntityDataFor` is used to generate a `EntityData`
 * instance for a given `Entity` instance.
 */
export function createEntityDataFor(entity: Entity): EntityData {
  return {
    type: entity.type,
    id: entity.id,
    created: String(entity.created),
    props: generateEntityPropertyDataFor(entity, isEntityProperty),
  }
}

/**
 * The `mapPropertyData` is used to map serialized property
 * `key/value` pairs to a given `Entity` instance
 */
export const mapPropertyData = (entity: Entity, props: EntityPropertyData[]): void => {
  for (const prop of props) {
    const {
      key, value, meta,
    } = prop
    if (key && meta && 'undefined' !== typeof value) {
      entity[key] = meta.boolean ? Boolean(value) :
        meta.number ? Number(value) :
          meta.object ? parse(String(value)) :
            meta.date ? new Date(String(value)) :
              meta.set ? new Set(parse(String(value)) as Array<unknown>) : value
    }
  }
}

/**
 * The `validateEntityFor` is ued to validate a given `Entity`.
 */
export const validateEntityFor = <E extends Entity>(entity: E, _class: EntityConstructor<E>): boolean => entity instanceof _class
