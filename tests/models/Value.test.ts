/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

import test from 'ava'

import {
  string,
  ValidationError,
} from 'yup'

import {
  Value,
  ValueError,
  defineValue,
} from '../../src'

class Email implements Value<string> {
  readonly value: string
  get domainAddress(): string {
    return this.value.split('@')[1]
  }
  constructor(value: string) {
    this.value = value
  }
}

const createEmail = defineValue(Email, {
  validate: (value: string): boolean => {
    return 'string' === typeof string().email('email is invalid').strict(true).validateSync(value)
  },
})

class Version implements Value<number> {
  readonly value: number
  constructor(value: number) {
    this.value = value
  }
}

const createVersionValue = defineValue(Version, {
  validate: (value: number): boolean => 0 < value,
})

test('Value: create value', t => {
  const e1 = 'susan@domain.com'
  const v1 = createEmail(e1)

  t.is(v1.value, e1)
})

test('Value: ValueError', t => {
  try {
    createVersionValue(0)
    t.false(true)
  }
  catch (error) {
    if (error instanceof ValueError) {
      t.is(error.name, 'ValueError')
      t.is(error.message, 'value is invalid')
    }
    else {
      t.false(true)
    }
  }
})

test('Value: ValidationError', t => {
  try {
    createEmail('123')
    t.false(true)
  }
  catch (error) {
    if (error instanceof ValidationError) {
      t.is(error.name, 'ValidationError')
      t.is(error.message, 'email is invalid')
    }
    else {
      t.false(true)
    }
  }
})

test('Value: get computed value', t => {
  const e1 = 'susan@domain.com'
  const v1 = createEmail(e1)

  const e2 = 'bob@domain.com'
  const v2 = createEmail(e2)

  t.is(v1.value, e1)
  t.is(v2.value, e2)
  t.is(v1.domainAddress, v2.domainAddress)
})

test('Value: ValueLifecycle', t => {
  const e1 = 'susan@domain.com'

  const createValue = defineValue(Email, {
    trace: (email: Email): void => {
      t.is(e1, email.value)
    },

    validate: (value: string): boolean => {
      t.is(e1, value)
      return 'string' === typeof string().email('email is invalid').strict(true).validateSync(value)
    },

    created: (email: Email): void => {
      t.is(e1, email.value)
    },
  })

  const v1 = createValue(e1)

  t.is(v1.value, e1)
  t.is(v1.domainAddress, e1.split('@')[1])
})