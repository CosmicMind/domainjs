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

import test from 'ava'
import { string } from 'yup'

import {
  uuidv4,
  FoundationError,
  FoundationTypeError,
  ProxyTypeError,
  ProxyImmutableError,
  ProxyMutableError,
  ProxyVirtualError,
  ProxyNotDefinedError,
} from '@cosmicverse/foundation'

import {
  Entity,
  validateEntityFor,
  createEntity,
  createEntityFor,
  EntityPropertyError,
} from '../src'

export class EntityObject extends Entity {
}

test('Entity: create Entity', async t => {
  const type = 'Entity'
  const createEntityObject = createEntity(type, {
    mutable: {
      name: string().defined().strict(true),
    },
  })

  const id = uuidv4()
  const created = new Date()
  const name = 'daniel'
  const mo = createEntityObject({
    id,
    created,
    name,
  })

  t.true(validateEntityFor(mo, Entity))
  t.is(mo.type, type)
  t.is(mo.id, id)
  t.is(mo.created, created)
  t.is(mo.name, name)
})

test('Entity: create EntityObject', async t => {
  const type = 'EntityObject'
  const createEntityObject = createEntityFor(EntityObject, {
    mutable: {
      name: string().defined().strict(true),
    },
  })

  const id = uuidv4()
  const created = new Date()
  const name = 'daniel'
  const mo = createEntityObject({
    id,
    created,
    name,
  })

  t.true(validateEntityFor(mo, EntityObject))
  t.is(mo.type, type)
  t.is(mo.id, id)
  t.is(mo.created, created)
  t.is(mo.name, name)
})

test('Entity: create with type set', async t => {
  const type = 'Entity'
  const createEntityObject = createEntity(type, {})

  try {
    const id = uuidv4()
    const created = new Date()
    const mo = createEntityObject({
      id,
      created,
      type,
    })

    t.true('undefined' === typeof mo)
  }
  catch (e) {
    if (e instanceof Error) {
      t.true(e instanceof FoundationError)
      t.true(e instanceof EntityPropertyError)
      t.is(e.name, 'EntityPropertyError')
      t.is(e.message, 'property (type) cannot be redefined')
    }
    else {
      t.true(false)
    }
  }
})

test('Entity: create ProxyTypeError', async t => {
  const type = 'Entity'
  const errorMessage = 'string is invalid'
  const createEntityObject = createEntity(type, {
    mutable: {
      name: string().typeError(errorMessage).defined().strict(true),
    },
  })

  try {
    const id = uuidv4()
    const created = new Date()
    const name = 33
    const mo = createEntityObject({
      id,
      created,
      name,
    })

    t.true('undefined' === typeof mo)
  }
  catch (e) {
    if (e instanceof Error) {
      t.true(e instanceof FoundationTypeError)
      t.true(e instanceof ProxyTypeError)
      t.is(e.name, 'ProxyTypeError')
      t.is(e.message, errorMessage)
    }
    else {
      t.true(false)
    }
  }
})

test('Entity: update ProxyTypeError', async t => {
  const type = 'Entity'
  const errorMessage = 'string is invalid'
  const createEntityObject = createEntity(type, {
    mutable: {
      name: string().typeError(errorMessage).defined().strict(true),
    },
  })

  try {
    const id = uuidv4()
    const created = new Date()
    const name = 'daniel'
    const mo = createEntityObject({
      id,
      created,
      name,
    })
    mo.name = 38

    t.true('undefined' === typeof mo)
  }
  catch (e) {
    if (e instanceof Error) {
      t.true(e instanceof FoundationTypeError)
      t.true(e instanceof ProxyTypeError)
      t.is(e.name, 'ProxyTypeError')
      t.is(e.message, errorMessage)
    }
    else {
      t.true(false)
    }
  }
})

test('Entity: delete ProxyImmutableError', async t => {
  const type = 'Entity'
  const createEntityObject = createEntity(type, {
    immutable: {
      name: string().defined().strict(true),
    },
  })

  try {
    const id = uuidv4()
    const created = new Date()
    const name = 'daniel'
    const mo = createEntityObject({
      id,
      created,
      name,
    })
    delete mo.name

    t.true('undefined' === typeof mo)
  }
  catch (e) {
    if (e instanceof Error) {
      t.true(e instanceof FoundationError)
      t.true(e instanceof ProxyImmutableError)
      t.is(e.name, 'ProxyImmutableError')
      t.is(e.message, 'property (name) is immutable')
    }
    else {
      t.true(false)
    }
  }
})

test('Entity: delete ProxyMutableError', async t => {
  const type = 'Entity'
  const createEntityObject = createEntity(type, {
    mutable: {
      name: string().defined().strict(true),
    },
  })

  try {
    const id = uuidv4()
    const created = new Date()
    const name = 'daniel'
    const mo = createEntityObject({
      id,
      created,
      name,
    })
    delete mo.name

    t.true('undefined' === typeof mo)
  }
  catch (e) {
    if (e instanceof Error) {
      t.true(e instanceof FoundationError)
      t.true(e instanceof ProxyMutableError)
      t.is(e.name, 'ProxyMutableError')
      t.is(e.message, 'property (name) is mutable')
    }
    else {
      t.true(false)
    }
  }
})

test('Entity: delete ProxyVirtualError', async t => {
  const type = 'Entity'
  const createEntityObject = createEntity(type, {
    virtual: {
      get fullName(): string {
        return 'Daniel Jonathan'
      },
    },
  })

  try {
    const id = uuidv4()
    const created = new Date()
    const mo = createEntityObject({
      id,
      created,
    })
    delete mo.fullName

    t.true('undefined' === typeof mo)
  }
  catch (e) {
    if (e instanceof Error) {
      t.true(e instanceof FoundationError)
      t.true(e instanceof ProxyVirtualError)
      t.is(e.name, 'ProxyVirtualError')
      t.is(e.message, 'property (fullName) is virtual')
    }
    else {
      t.true(false)
    }
  }
})

test('Entity: defined ProxyImmutableError', async t => {
  const type = 'Entity'
  const createEntityObject = createEntity(type, {
    immutable: {
      name: string().defined().strict(true),
    },
  })

  try {
    const id = uuidv4()
    const created = new Date()
    const name = 'daniel'
    const mo = createEntityObject({
      id,
      created,
      name,
    })
    mo.name = 'jonathan'

    t.true('undefined' === typeof mo)
  }
  catch (e) {
    if (e instanceof Error) {
      t.true(e instanceof FoundationError)
      t.true(e instanceof ProxyImmutableError)
      t.is(e.name, 'ProxyImmutableError')
      t.is(e.message, 'property (name) is immutable')
    }
    else {
      t.true(false)
    }
  }
})

test('Entity: ProxyNotDefinedError', async t => {
  const type = 'Entity'
  const createEntityObject = createEntity(type, {
    mutable: {
      name: string().defined().strict(true),
    },
  })

  try {
    const id = uuidv4()
    const created = new Date()
    const name = 'daniel'
    const mo = createEntityObject({
      id,
      created,
      name,
    })
    mo.age = 38

    t.true('undefined' === typeof mo)
  }
  catch (e) {
    if (e instanceof Error) {
      t.true(e instanceof FoundationError)
      t.true(e instanceof ProxyNotDefinedError)
      t.is(e.name, 'ProxyNotDefinedError')
      t.is(e.message, 'property (age) is not defined')
    }
    else {
      t.true(false)
    }
  }
})

test('Entity: virtual string', async t => {
  const type = 'Entity'
  const createEntityObject = createEntity(type, {
    mutable: {
      name: string().defined().strict(true),
    },
    virtual: {
      get fullName(): string {
        const name = this.name as string
        const result = name.charAt(0).toUpperCase() + name.slice(1)
        return `${result} Jonathan`
      },
    },
  })

  const id = uuidv4()
  const created = new Date()
  const name = 'daniel'
  const mo = createEntityObject({
    id,
    created,
    name,
  })

  t.true(validateEntityFor(mo, Entity))
  t.is(mo.type, type)
  t.is(mo.id, id)
  t.is(mo.created, created)
  t.is(mo.name, name)
  t.is(mo.fullName, 'Daniel Jonathan')
})

test('Entity: update ProxyVirtualError', async t => {
  const type = 'Entity'
  const createEntityObject = createEntity(type, {
    mutable: {
      name: string().defined().strict(true),
    },
    virtual: {
      get fullName(): string {
        const name = this.name as string
        const result = name.charAt(0).toUpperCase() + name.slice(1)
        return `${result} Jonathan`
      },
    },
  })

  try {
    const id = uuidv4()
    const created = new Date()
    const name = 'daniel'
    const mo = createEntityObject({
      id,
      created,
      name,
    })
    mo.fullName = 'Daniel Jonathan'

    t.true('undefined' === typeof mo)
  }
  catch (e) {
    if (e instanceof Error) {
      t.true(e instanceof FoundationError)
      t.true(e instanceof ProxyVirtualError)
      t.is(e.name, 'ProxyVirtualError')
      t.is(e.message, 'property (fullName) is virtual')
    }
    else {
      t.true(false)
    }
  }
})

test('Entity: serialized', async t => {
  const type = 'Entity'
  const createEntityObject = createEntity(type, {
    mutable: {
      name: string().defined().strict(true),
    },
    virtual: {
      get fullName(): string {
        const name = this.name as string
        const result = name.charAt(0).toUpperCase() + name.slice(1)
        return `${result} Jonathan`
      },
    },
  })

  const id = uuidv4()
  const created = new Date()
  const name = 'daniel'
  const mo = createEntityObject({
    id,
    created,
    name,
  })

  t.is(mo.serialized, `{"type":"${type}","id":"${id}","created":"${created}","props":[{"key":"name","value":"${name}","meta":{"string":true}}]}`)
})
