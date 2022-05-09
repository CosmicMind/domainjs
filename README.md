# Domain

Welcome to Domain, a framework for building applications with Domain-driven design in TypeScript.

## What is Domain-driven design?

Accoring to [Wikipedia](https://en.wikipedia.org/wiki/Domain-driven_design), "Domain-driven design, or DDD as its acronym, is as software design approach focusing on modelling software to match a domain according to input from that domain's experts."

- What does this DDD description really mean? 
- Is the software design approach the right one for my project?
- How quickly can I already be improving my project with DDD's concepts?
- The list goes on...

These are all really good questions, and the list goes on and on. Let's answer the first 3 questions, and if you have any more, feel free to ask. You may find that you can answer them yourself once you understand the tools available in the *Domain framework* and DDD patterns themselves.

### WHat is DDD really? 

Domain-driven design is a set of patterns to follow in order to solve problems. At the core of the solution's design, there is an emphasasis on the business and technical teams being aligned through clear communication and understandings of what a solution actually is.

### Is DDD right for my project? 

Ultimately, this is a decision each project's team will need to make. By using Domain, even if a project doesn't fully adhere to Domain-driven designs's concepts, the tooling and features will help to organize, build, validate, and ultimately design great software. 

### How quickly can I already be improving my project with DDD's concepts? 

For this question, let's write some code. First, let's set the stage with our problem. You have incoming data that is going to be validated before used. You don't necessaryily know where this data is coming from, but it will be passed to your function for processing of some sort, for example: 

1. adding entries into your database
2. authenticating a user
3. fetching resources from an external service

All three of these examples are typical, and the list can esily be expanded. The basic issue is to validate incoming data and process it. In a typical project, this scenario can easily create code that looks like this: 

```typescript
function login(email: string, password: string, date: Date): Promise<User> {
   // validate email
   // validate password
   // validate date
   
   // if failure to validate, reject

   // try to authenticate 

   // reject or resolve the authenticated user
}
```

We can now see our first issue with our current design. The *email*, *password*, and *date* can be many values other than what we are expecting. This is why validation needs to be a first step. Now, imagine how many places may take these parameters, or similar ones. This would require validation to repeat itself over and over again. There is an option to write a core validation library, which actually wouldn't remove any lines of code, but replace them with similarly disconnected tools, for example:

```typescript
function login(email: string, password: string, date: Date): Promise<User> {
   // library.validate email
   // library.validate password
   // library.validate date

   // ...
}
```

What would be the best scenario here? It could be said that the best scenario is one where the values passed into the *login* function are already validated, and the tools to validate that data is always within scope of the data itself, so the value couldn't exist if it wasn't validated.

What would my code look like if it was self validating and could only exist if validated?

```typescript
function login(email: EmailVO, password: PasswordVO, date: DateVO): Promise<UserVO> {
   // try to authenticate 

   // reject or resolve the authenticated user
}
```

What is a *VO*? VO stands for **Value Object** and characteristically implies that a value itself can only exist if valid, and the object itself knows how to validate it's own data. Let's create our first *Value Object*, or *VO*. 

Let it be said, solving these kinds of problems, and much more challenging ones are at your finger tips with **Domain**.

## Instaling Domain

###### NPM

```zsh
npm install @cosmicverse/domain yup
```

In order to validate our data, we will use [YUP](https://github.com/jquense/yup). Please read the documentation for YUP in order to discover how dynamic your validation strategy can be. By reading through this repo and the sample projects that are shared, you will begin to get a grasp for YUP regardless. 

Let's create a new file called *EmailVO.ts* and define our *EmailVO creator* function that can be utilized anywhere in our project. In the following code snippet, you will see the initial setup for creating a VO that will set the code up to allow for the most flexible configuration later on.

```typescript
// EmailVO.ts

import { string } from 'yup'

import {
   Value,
   createValueFor,
} from '@cosmicverse/domain'

class Email extends Value {}

const createEmailVO = createValueFor(Email, string().email())
```

In our example, we will receive the email data through a network request to our API or service. At this point it would be a great place to create our EmailVO instance. As you learn to use *Domain*, it will be clear how and when to create VOs. For now, this is the best place to further our example.

```typescript
// UserAPI.ts

import { createEmailVO } from 'src/vos/EmailVO'

// a bunch of code ...

function handler(request) {
   const email = createEmailVO(request.body.email)
   
   login(email, ...)
}

// ... a bunch of more code
```

... more to come

The above code snippet is purely for demonstration purposes. A real life world example to follow... 


## License

BSD 3-Clause License

Copyright (c) 2022, Daniel Jonathan <daniel at cosmicverse dot com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.