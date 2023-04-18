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
type User = {
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
defining the Entity with validators that are called before creating and updating the user attributes/properties. 
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
  }
})
```

```typescript
import { 
  createUser
} from './User'

const user = createUser({
  id: '123',
  name: 'Daniel',
  age: 39,
})
```
Now when the `user` is passed to `someFunction` above, it is impossible for the User instance to exist if it is invalid. I can confidently
use the User instance in my code logic. 
