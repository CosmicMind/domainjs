# Welcome to DomainJS

Inspired by [Domain-driven design](https://en.wikipedia.org/wiki/Domain-driven_design) (DDD), DomainJS is a framework 
that utilizes the powerful concepts within DDD to build reliable and well-defined software.

### Entities - What are they

In Domain-driven design (DDD) an entity is a representation of an object within a given domain, for example: a book, product order, and user would be 
entities within a domain that handles purchase orders for an e-commerce website that sold books. Let's take a look at an entity type definition for a user within our domain.

```typescript
// User.ts

import {
  Entity,
} from '@cosmicmind/domainjs'

export type User = Entity & {
  id: string
  name: string
  age: number
}
```

The above example is a user entity type definition. It represents an object, in this case a user within our domain. The user is defined by the id, name, and age attribute values. When working with entities, 
DomainJS will immediately help within the following areas of concern:

1. How to validate entities and reliably construct new entity instances?
2. How to observe the entity lifecycle?

#### How to validate entities and reliably construct new entity instances?

Let's take a look at the following code example to understand attribute value validation in DomainJS.

```typescript
import {
  User,
} from './User'

function someFunction(user: User): void {
  // ... do something
}

const user: User = {
  id: '123',
  name: 'Sarah',
  age: 29,
}

// ... 

someFunction(user)
```

In the above code, we can see that the `user` passed to `someFunction` actually doesn't provide any guarantees of its validity. In order to guarantee validity within
`someFunction`, validation logic would need to be executed within the function itself. An issue arises when we need to constantly validate our entities, causing validation 
logic to exist in multiple places within our codebase. DomainJS defines the validation logic within the entity itself and calls the appropriate validators when creating and 
updating entities, for example:

```typescript
// User.ts

import {
  Entity,
  defineEntity,
} from '@cosmicmind/domainjs'

export type User = Entity & {
  id: string
  name: string
  age: number
}

export const createUser = defineEntity<User>({
  attributes: {
    id: {
      validate(value): boolean | never {
        // id validation logic
        // return true | false
        // or throw an error
      },
    },
    
    name: {
      validate(value): boolean | never {
        // name validation logic
        // return true | false
        // or throw an error
      },
    },

    age: {
      validate(value): boolean | never {
        // age validation logic
        // return true | false
        // or throw an error
      },
    },
  },
})
```

```typescript
import { 
  createUser,
} from './User'

const userA = createUser({
  id: '123',
  name: 'Daniel',
  age: 39,
})

console.log(userA.id) // "123"
console.log(userA.name) // "Daniel"
console.log(userA.age) // 39
```

Now when the `user` is passed to `someFunction` above, it is impossible for the entity to exist if it is invalid. 

#### How to observe the entity lifecycle?

DomainJS organizes lifecycle hooks within the entity definition itself, like so: 

```typescript
export const createUser = defineEntity<User>({
  created(user) {
    // ... do something
  },
  
  trace(user) {
    // ... do something
  },
  
  attributes: {
    // ...
    
    age: {
      validate(value): boolean | never {
        // ... do something 
      }, 
      
      udpated(newValue, oldValue, user): void {
        // ... do something
      },
    },
    
    // ...
  },
})
```

The above example shows the various lifecycle hooks available for entities. Let's take a look at each one of these
hooks to understand when they are executed. 

##### created

The `created` lifecycle hook is executed only once when an instance is initially created. 

##### updated

The `updated` lifecycle hook is executed after an attribute has been updated.

##### trace

The `trace` lifecycle hook is executed after the `created` and `updated` lifecycle hooks.

### Value Objects

A Value Object (VO) in Domain-driven design encapsulates a single value and its validity. Further to ensuring its validity, 
a VO provides specific functionality that is relevant to the value itself, for example: 

```typescript
// Email.ts

import {
  Value,
  defineValue,
} from '@cosmicmind/domainjs'

export class Email extends Value<string> {
  get domainAddress(): string {
    return this.value.split('@')[1]
  }
}

export const createEmail = defineValue(Email, {
  created(email): void {
    // ... do something
  },

  trace(email) {
    // ... do something
  },
  
  validate(value): boolean | never {
    // email validation logic
    // return true | false
    // or throw an error
  },
})
```

```typescript
import { 
  createEmail,
} from './Email'

const email = createEmail('me@domain.com')

console.log(email.value) // "me@domain.com"
console.log(email.domainAddress) // "domain.com"
```



```typescript
// User.ts

import {
  Entity,
  defineEntity,
} from '@cosmicmind/domainjs'

import {
  Email,
} from './Email'

export type User = Entity & {
  id: string
  name: string
  age: number
  email: Email
}

export const createUser = defineEntity<User>({
  attributes: {
    id: {
      validate(value): boolean | never {
        // id validation logic
        // return true | false
        // or throw an error
      },
    },
    
    name: {
      validate(value): boolean | never {
        // name validation logic
        // return true | false
        // or throw an error
      },
    },

    age: {
      validate(value): boolean | never {
        // age validation logic
        // return true | false
        // or throw an error
      },
    },
  },
})
```

```typescript
import { 
  createUser,
} from './User'

import {
  createEmail,
} from './Email'

const user = createUser({
  id: '123',
  name: 'Daniel',
  age: 39,
  email: createEmail('me@domain.com'),
})

console.log(user.id) // "123"
console.log(user.name) // "Daniel"
console.log(user.age) // 39
console.log(user.email.value) // "me@domain.com"
console.log(user.email.domainAddress) // "domain.com"
```

Value Objects are great for parameter passing and letting the function know that it is using a 
valid value. For example:

```typescript
import {
  Email,
} from './Email'

function someFunction(email: Email): void {
  if ('domain.com' === email.domainAddress) {
    // ... do something
  }
}
```

### Aggregates - Defining possibilities while encapsulating the logic

Aggregates are a very powerful concept in Domain-driven design and arguably the most complicated part of the 
design paradigm itself. Let's simplify the complexities by thinking of Aggregates as the broker for Entities. 
An Aggregate is effectively the allowable functionality for a given Entity. The easiest way to discuss Aggregates is 
with an example. We will expand on our User Entity, and provide some additional features: 

1. Data encapsulation and value accessibility. 
2. Added functionality defined by the Aggregate.
3. Event publishing.

#### Data encapsulation and value accessibility

Aggregates effectively encapsulate Entities and expose what it would like in the form that it would like to, for example: 

```typescript
// UserAggregate.ts

import {
  Aggregate,
  defineAggregate,
} from '@cosmicmind/domainjs'

import {
  User,
} from './User'

import {
  Email,
} from './Email'

export class UserAggregate extends Aggregate<User> {
  get id(): string {
    return this.root.id
  }

  get email(): Email {
    return this.root.email
  }

  registerAccount(): void {
    // ... do something
  }
}

export const createUserAggregate = defineAggregate(UserAggregate, {
  created(user) {
    // ... do something
  },

  trace(user) {
    // ... do something
  },

  attributes: {
    // ...

    age: {
      validate(value): boolean | never {
        // ... do something 
      },

      udpated(newValue, oldValue, user): void {
        // ... do something
      },
    },

    // ...
  },
})
```

```typescript
import { 
  createUserAggregate
} from './UserAggregate'

import {
  createEmail,
} from './Email'

const user = createUserAggregate({
  id: '123',
  name: 'Daniel',
  age: 39,
  email: createEmail('me@domain.com'),
})

console.log(user.id) // "123"
console.log(user.name) // error cannot access (not exposed in UserAggragte)
console.log(user.age) // error cannot access (not exposed in UserAggragte)
console.log(user.email.value) // "me@domain.com"
console.log(user.email.domainAddress) // "domain.com"

user.registerAccount() // ... account registration process
```

In the above example there is quite a bit going on, so let's break it down. The first item to notice is that
we can define various Entity definitions for a given Aggregate. This allows for a lot of flexibility. All the 
features available to an Entity and Value Object are now available to the Aggregate with the added ability to
encapsulate and modify that functionality. 

The Aggregate sets the entity to the protected `root` property and only allows exposure based on the API definition 
of the Aggregate itself. This is great when our code needs to manage data but doesn't want to expose it to the outside 
world. 

The next item to notice is that we can add functionality to our Entity, through the Aggregate, such as the `registerAccount` method. 
The functionality itself is defined within the Aggregate, and therefore allows us to define various Aggregates with the 
same Entity definition. (More examples on this to come).

### Aggregate Events

Let's expand our example further by adding Event publishing to the Aggregate. DomainJS allows for Events to be 
constructed very much like Entities. The values each have the opportunity to encapsulate validation and the `created` 
and `trace` lifecycle hooks are available as well. Let's create a `RegisterAccountEvent`. 

```typescript
// RegisterAccountEvent.ts

import {
  Event,
  defineEvent,
} from '@cosmicmind/domainjs'

import {
  User,
} from './User'

export type RegisterAccountEvent = Event & {
  id: string
  user: User
}

export const createRegisterAccountEvent = defineEvent<RegisterAccountEvent>({
  attributes: {
    id: {
      validate(value): boolean | never {
        // id validation logic
        // return true | false
        // or throw an error
      },
    },
  },
})
```

Now that we have our `RegisterAccountEvent`, let's add it to the `UserAggregate` example. 

```typescript
// UserAggregate.ts

import {
  Aggregate,
  defineAggregate,
  EventTopics,
} from '@cosmicmind/domainjs'

// ...

import {
  RegisterAccountEvent,
  createRegisterAccountEvent,
} from './RegisterAccountEvent'

export type UserAggregateEventTopics = EventTopics & {
  'register-account': RegisterAccountEvent
}

export class UserAggregate extends Aggregate<User, UserAggregateEventTopics> {
  // ...

  registerAccount(): void {
    // ... do something

    this.publishSync('register-account', createRegisterAccountEvent({
      id: '123',
      user: this.root,
    }))
  }
}

// ...
```

```typescript
import { 
  createUserAggregate
} from './UserAggregate'

import {
  createEmail,
} from './Email'

const user = createUserAggregate({
  id: '123',
  name: 'Daniel',
  age: 39,
  email: createEmail('me@domain.com'),
})

user.subscribe('register-account', (event: RegisterAccountEvent) => {
  // ... do something
})

console.log(user.id) // "123"
console.log(user.name) // error cannot access (not exposed in UserAggragte)
console.log(user.age) // error cannot access (not exposed in UserAggragte)
console.log(user.email.value) // "me@domain.com"
console.log(user.email.domainAddress) // "domain.com"

user.registerAccount() // ... account registration process and event is published
```

## What's Next

Additional documentation and examples will follow shortly. If you have any examples or use cases that 
you are interested in exploring, please create a discussion. 

Thank you! 
