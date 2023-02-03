/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

import {
  it,
  expect,
  describe,
} from 'vitest'

import {
  string,
  ValidationError,
} from 'yup'

import {
  Value,
  ValueError,
  defineValue,
} from '@/internal'

class Email extends Value<string> {
  get domainAddress(): string {
    return this.value.split('@')[1]
  }
}

const createEmail = defineValue(Email, {
  validate: (value: string): boolean =>
    'string' === typeof string().email('email is invalid').strict(true).validateSync(value),
})

class Version extends Value<number> {}

const createVersionValue = defineValue(Version, {
  validate: (value: number): boolean => 0 < value,
})

describe('Value', () => {
  it('create value', () => {
    const email = 'me@domain.com'
    const vo = createEmail(email)
    expect(vo.value).toBe(email)
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
    const email1 = 'me@domain.com'
    const vo1 = createEmail(email1)

    const email2 = 'you@domain.com'
    const vo2 = createEmail(email2)

    expect(vo1.value).toBe(email1)
    expect(vo2.value).toBe(email2)
    expect(vo1.domainAddress).toBe(vo2.domainAddress)
  })

  it('ValueLifecycle', () => {
    const email = 'me@domain.com'

    const createValue = defineValue(Email, {
      trace(vo: Email): void {
        expect(email).toBe(vo.value)
      },

      validate(value: string, vo: Email): boolean {
        expect(email).toBe(value)
        expect(email).toBe(vo.value)
        return 'string' === typeof string().email('email is invalid').strict(true).validateSync(value)
      },

      createdAt(vo: Email): void {
        expect(email).toBe(vo.value)
      },
    })

    const vo = createValue(email)
    expect(vo.value).toBe(email)
    expect(vo.domainAddress).toBe(email.split('@')[1])
  })
})
