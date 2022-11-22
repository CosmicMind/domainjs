/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

import {
it,
expect,
describe
} from 'vitest'

import {
string,
ValidationError
} from 'yup'

import {
Value,
ValueError,
defineValue
} from '../../src'

class Email extends Value<string> {
  get domainAddress(): string {
    return this.value.split('@')[1]
  }
}

const createEmail = defineValue(Email, {
  validate: (value: string): boolean => {
    return 'string' === typeof string().email('email is invalid').strict(true).validateSync(value)
  },
})

class Version extends Value<number> {}

const createVersionValue = defineValue(Version, {
  validate: (value: number): boolean => 0 < value,
})

describe('Value', () => {
  it('create value', () => {
    const e1 = 'susan@domain.com'
    const v1 = createEmail(e1)

    expect(v1.value).toBe(e1)
  })

  it('ValueError', () => {
    try {
      createVersionValue(0)
      expect(true).toBeFalsy()
    }
    catch (error) {
      if (error instanceof ValueError) {
        expect(error.name, 'ValueError')
        expect(error.message, 'value is invalid')
      }
      else {
        expect(true).toBeFalsy()
      }
    }
  })

  it('ValidationError', () => {
    try {
      createEmail('123')
      expect(true).toBeFalsy()
    }
    catch (error) {
      if (error instanceof ValidationError) {
        expect(error.name, 'ValidationError')
        expect(error.message, 'email is invalid')
      }
      else {
        expect(true).toBeFalsy()
      }
    }
  })

  it('get computed value', () => {
    const e1 = 'susan@domain.com'
    const v1 = createEmail(e1)

    const e2 = 'bob@domain.com'
    const v2 = createEmail(e2)

    expect(v1.value).toBe(e1)
    expect(v2.value).toBe(e2)
    expect(v1.domainAddress).toBe(v2.domainAddress)
  })

  it('ValueLifecycle', () => {
    const e1 = 'susan@domain.com'

    const createValue = defineValue(Email, {
      trace: (email: Email): void => {
        expect(e1).toBe(email.value)
      },

      validate: (value: string): boolean => {
        expect(e1).toBe(value)
        return 'string' === typeof string().email('email is invalid').strict(true).validateSync(value)
      },

      createdAt: (email: Email): void => {
        expect(e1).toBe(email.value)
      },
    })

    const v1 = createValue(e1)

    expect(v1.value).toBe(e1)
    expect(v1.domainAddress).toBe(e1.split('@')[1])
  })
})
