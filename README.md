# Welcome to DomainJS

Inspired by Domain-driven design, DomainJS is a framework intended to help with the complexities of system design. 
Although the framework aims to solve big problems, it is built from tackling smaller problems that are at the core
of software design and effectively system design. 

### Why TypeScript? 

In my opinion, software is an incredibly fun area to study and more so, implement creative solutions in a now ever
more distributed landscape. As the canvas becomes more widespread, the paintbrushes need to behave differently. 
TypeScript, and well JavaScript really, offer such an ability. It is possible to design a tool, component, or even
framework that exists and powers a fully interactive client and further computes a prediction that accepts events
from a stream of user engagement. 

TypeScript simplifies the "location" as to where code runs by allowing a single piece of
software to function in multiple areas. DomainJS takes full advantage of this and offers building blocks to create
reliable, flexible, and most importantly secure software. 

### Break It, Shake It, Share It

As the maintainer of DomainJS, I invite you to use the framework in ways I have not thought of, to push its
boundaries, and to then share it with the community. This library is my way of saying "Hello World, I want
to code with you". I hope you enjoy what has been and continues to be a fun framework to build and use in my projects.

## Basic Principles of DomainJS

I recommend reading more on [Domain-driven design](https://en.wikipedia.org/wiki/Domain-driven_design) if your goal is 
to build something robust, but before you do that, I will share with you a few key concepts found within DomainJS that 
regardless of the type of software you are developing, will act as a solid foundation for your code and ultimately system. 

## Entities - What are they and how to trust them. 

Software would arguably have no use if it wasn't doing something. That "something" it does - needs a "thing" to do it with.
There are some good definitions out there for Entities, please share one when you find it. Generally, let's think
of an Entity as a "thing", for example: a book, a house, a person, a system, ... anything that can conceptually be unified 
into a single representative structure is potentially an entity. Let's take a look at an entity definition of a `User` in
our system.

```typescript
// User.ts

export type User = {
  id: string
  name: string
  age: number
}
```

That's it, the above example is an Entity. It represents a "thing", in this case a user in our system. The user itself
is not so interesting until we look at what defines it. In this case, the user is defined by an "id" hopefully unique,
a name that doesn't need to be unique, and an age, which is a number. There are a few major challenges though with this:

1. How do I know I am getting what I am actually wanting? 
2. How to reliably construct a new User instance from this definition?
3. How to observe changes within the entity's lifecycle?

I am sure there are more challenges than the three above. I find that if I can't solve the three proposed challenges,
none of the others really matter. So before we create a massive list of things to concern ourselves with, let's keep
it to its arguable core challenges.

#### How do I know I am getting what I am actually wanting? 

Let's look at some code that constructs a new User from the Entity definition above. 

```typescript
const user: User = {
  id: '123',
  name: 'Daniel',
  age: 39,
}

// ... a bunch of code is executed ... and eventually I hit a function that accepts a User instance

function someFunction(user: User): void {
  // ... do something interesting
}
```

From the above example, it may be very clear that the `user` instance passed to `someFunction` actually
doesn't provide any guarantees of what it really is. Yes, the TypeScript type checker will provide an error
message if a type were passed that is not part of the User type family. As helpful as that is, it really doesn't
tell me much about the values that make up the `user` instance, other than I have two strings and a number. 

Normally, a validator would be used somewhere to ensure that the User instance does in fact have values that are
meaningful to process without general concern. Here is the fundamental problem though, the validator and the User 
type are separated by design. In order to 100% guarantee that I am dealing with an instance of a User, I would need 
to validate it within the function, otherwise the function is blindly trusting its caller. That may sound like enough, 
but if you are like me, I prefer not to trust outside systems and code, including callers to functions within the same 
code block. How can we solve this? 

In order to provide a 100% guarantee that a user is actually the User type I am looking for, the User type would
itself need to be its own validator, and thus can only exist when it is valid. In DomainJS, this is achieved by
defining the Entity with validators that are called before creating and updating the user attributes. 
For example:

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

const user = createUser({
  id: '123',
  name: 'Daniel',
  age: 39,
})

console.log(user.id) // "123"
console.log(user.name) // "Daniel"
console.log(user.age) // 39
```

Now when the `user` is passed to `someFunction` above, it is impossible for the User instance to exist if it is invalid. I can confidently
use the User instance in my code logic. We inherently answered question (2) - `How to reliably construct a new User instance from this definition?`. 
By using the `constructor function` or `factory method`, depending on the terminology you want to use ... bottom line the function that reliably
creates User instances. The validators are nicely tucked away into a single and reusable piece of code. The `User.ts` file can be included in both
frontend and backend code bases, and in both worlds will define a User in the same way. 

For the experienced developer, it may look like we introduced another issue, where now our validators need to be duplicated within Entity definitions. 
There is an elegant way to handle this within DomainJS and generally Domain-driven design. Look at `Value Objects` below if you'd like to jump into that
topic. 

Our final concern (3) - `How to observe changes within the entity's lifecycle?` is an advanced topic within DomainJS as there are various ways to approach
Observability and Traceability - fancy words for "know and observe what is happening with precision in my system". 

#### How to observe changes within the entity's lifecycle?

Probably one of the most complicated challenges in software design is how to monitor and debug code. If you are like me, you have probably used the 
"console.log" feature in JavaScript way too much, that said, probably my favourite line of code to insert as it reveals so much. That said, I find
that the "console.log" function is placed within too many areas of my code, very similar to validators. DomainJS organizes lifecycle hooks within
the Entity definition itself, like so: 

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

##### trace

The `trace` lifecycle hook is executed after the `created` lifecycle hook is executed and
after the attribute `updated` lifecycle is executed.

##### updated

The `updated` lifecycle hook is executed after an attribute has been updated.

## Value Objects - if it's not what I want, I don't want it

A Value Object is generally a Domain-driven design concept, though other paradigms and even coding languages adopt the core principle of a Value Object. 

Values Objects are very similar to Entities in that they can only exist if they are valid, yet they offer some additional features
that are beneficial.

#### Value Objects are easily sharable

The purpose of a Value Object is to encompass a single value and its validity. Further to ensuring its validity, Values Objects (VOs) provide specific functionality 
that is relevant to the value itself. Let's look at an example: 

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

The code above shows the flexibility of a Value Object, while ensuring that the value itself is always valid.
A good use case for Value Objects are as parameter values, or attributes of an Entity. Value Objects allow 
sharable values without any code duplication. Let's look at an example within an Entity definition by adding
the Email VO to our User Entity. 

Our new User definition is found below. Notice that we don't need to create
a validator in our User definition for emails, as the Value Object itself already handles that. We could however
add additional validations within the Entity if we felt that further specific validations were needed. Furthermore,
the helpful functionality available within the Email Value Object is available to the Entity.

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

Value Objects are great for parameter passing, letting the function handler know that it is using a 
valid value. For example:

```typescript
import {
  Email,
} from './Email'

function someFunction(email: Email): void {
  if ('domain.com' === email.domainAddress) {
    // ... do something
  }
  
  // ... do something
}
```

## Aggregates - Defining possibilities while encapsulating the logic

Aggregates are a very powerful concept in Domain-driven design and arguably the most complicated part of the 
design paradigm itself. Let's simplify the complexities by thinking of Aggregates as the broker into Entities. 
An Aggregate is effectively the allowable functionality for a given Entity. The easiest way to discuss Aggregates
with an example. We will expand on our User Entity, and provide some additional features: 

1. Data encapsulation and value accessibility. 
2. Functionality features defined by the Aggregate.
3. Event publishing.

#### Data encapsulation and value accessibility.

Aggregates effectively hide the Entity that it encapsulates and gives the Aggregate the ability to expose what it would like
in the form that it would like to, for example: 

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
we can define various Entity definitions for the given User type. This allows for a lot of flexibility. All the 
features available to an Entity and Value Object are now available to the Aggregate with the added ability to
encapsulate and modify that functionality. 

The Aggregate sets the entity to the protected `root` property and only allows exposure based on the API definition 
of the Aggregate itself. This is great when our code needs to manage data but doesn't want to expose it to the outside 
world. 

The next item to notice is that we can add functionality to our Entity, such as the `registerAccount` method. 
The functionality itself is defined within the Aggregate, and therefore allows us to define various Aggregates with the 
same Entity definition. 

### Aggregate Events

Let's expand our example further by adding Event publishing to the Aggregate. DomainJS allows for events to be 
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

export type createRegisterAccountEvent = defineEvent<RegisterAccountEvent>({
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

export type UserAggregateTopics = EventTopics & {
  'register-account': RegisterAccountEvent
}

export class UserAggregate extends Aggregate<User, UserAggregateTopics> {
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

# What's Next

Additional documentation and examples will follow shortly. If you have any examples or use cases that 
you are interested in exploring if DomainJS can help, please create a discussion. 

Thank you! 
