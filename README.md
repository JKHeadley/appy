# appy
A user system leveraging [rest-hapi](https://github.com/JKHeadley/rest-hapi) to bootstrap your app.

appy is a boilerplate user system inspired by the [frame](https://github.com/jedireza/frame) user system that leverages the powerful [rest-hapi](https://github.com/JKHeadley/rest-hapi) API generator.  The goal of appy is to provide a quick to setup and easy to use user system that is also capable of supporting a wide range of applications.  By leveraging [rest-hapi](https://github.com/JKHeadley/rest-hapi), adding new endpoints is as simple as defining a new model, and model associations are a snap.  Bootstrapping your app has never been easier!

## Features

* Registration and account activation flows
* Login system with forgot password and reset password
* Abusive login attempt detection
* User permissions based on roles and groups
* Three optional authentication strategies
* Endpoint validation and query support
* Swagger docs for easy endpoint access

## Technologies

appy implements a [hapi](https://github.com/hapijs/hapi) framework server.  appy's RESTful API endpoints are generated through [rest-hapi](https://github.com/JKHeadley/rest-hapi), which means models are based off of [mongoose](https://github.com/Automattic/mongoose) and data is stored in [MongoDB](www.mongodb.org).

## Live demo

View the swagger docs for the live demo:

http://ec2-35-164-131-1.us-west-2.compute.amazonaws.com:8125

## Readme contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [First time setup](#first-time-setup)
- [Running appy](#running-appy)
- [Swagger documentation](#swagger-documentation)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [License](#license)
- [Questions](#questions)
- [Contributing](#contributing)
- [Thanks!](#thanks)


## Requirements

You need [Node.js](https://nodejs.org/en/) installed and you'll need [MongoDB](https://docs.mongodb.com/manual/installation/) installed and running.

[Back to top](#readme-contents)

## Installation

```
$ git clone https://github.com/JKHeadley/appy.git
$ cd appy
$ npm install
```

[Back to top](#readme-contents)

## Configuration
appy configuration follows [frame's](https://github.com/jedireza/frame) configuration flow:

> Simply edit ``config.js``. The configuration uses confidence which makes it easy to manage configuration settings across environments. Don't store secrets in this file or commit them to your repository.

> Instead, access secrets via environment variables. We use dotenv to help make setting local environment variables easy (not to be used in production).

> Simply copy .env-sample to .env and edit as needed. Don't commit .env to your repository.

## First time setup
**WARNING**: This will clear all data in the following MongoDB collections (in the db defined in ``restHapiConfig.mongo.URI``, default ``mongodb://localhost/appy``) if they exist: ``user``, ``role``, ``group``, ``permission``, ``session``, and ``authAttempt``.

If you would like to seed your database with some data, run:

```
$ gulp seed
```

NOTE: The password for all seed users is ``root``.

You can use these models as templates for your models or delete them later if you wish.

[Back to top](#readme-contents)

## Running appy

To quickly run the app locally, simply run:

```
$ gulp
```

appy uses the ``NODE_ENV`` enviroment variable for configuration.  To choose an environment run one of the following:

Local environment:
```
$ gulp serve:local
```
Development environment:
```
$ gulp serve:development
```
Production environment:
```
$ gulp serve:production
```

Once the app is running point your browser to http://localhost:8125/ to view the Swagger docs.

[Back to top](#readme-contents)

## Swagger documentation

Swagger documentation is automatically generated for all endpoints and can be viewed by pointing a browser at the server URL. By default this will be http://localhost:8125/. The swagger docs provide quick access to testing your endpoints along with model schema descriptions and query options.

[Back to top](#readme-contents)

## Authentication

There are three optional authentication strategies in appy and each make use of javascript web tokens (JWT) and the [hapi-auth-jwt2](https://www.npmjs.com/package/hapi-auth-jwt2) scheme.  The three strategies are:

1. Standard token
2. Session
3. Session with refresh token

The strategy used is determined by the ``restHapiConfig.authStrategy`` config property.

For a more in-depth description of these strategies, please view the wiki.

[Back to top](#readme-contents)

## Authorization

Authorization in appy is enforced via the hapi ``scope`` endpoint property.  Endpoints generated through [rest-hapi](https://github.com/JKHeadley/rest-hapi) come prepopulated with scope values.

User scope values are populated based on appy's permission system.  User's gain permissions based on three associations:

1. User defined permissions
2. Group defined permissions
3. Role defined permissions

Users must belong to at least one role and can belong to multiple groups.  Each permission association carries with it an ``enabled`` property that can be set to true or false.  This property allows permissions to override each other based on priority.  User permissions have the highest priority, followed by Group permissions and lastly Role permissions:
```
User->Group->Role
```
This allows easy and specific configuration of user endpoint access.  In general, a user will gain the majority of it's permissions through it's role.  Those permissions will be further defined by any groups the user belongs to.  Finally a user might have a few specific permissions assigned directly to them.  A user's scope final scope is a combination of the user's role, groups, and effective permissions.  See below for an example:

User: ``'test@manager.com'``
Role: ``'Admin'``
Role Permissions: 
```
[
  { name:'readUser', enabled:true },
  { name:'updateUser', enabled:true },
  { name:'addUserPermissions', enabled:true },
  { name:'removeUserPermissions', enabled:true }
]
```
Groups: ``['Managers']``
Group Permissions: 
```
[
  { name:'updateUser', enabled:false },
]
```
User Permissions: 
```
[
  { name:'removeUserPermissions', enabled:false },
]
```

Final Scope:
```
['Admin','Managers','readUser','addUserPermissions']
```

[Back to top](#readme-contents)


## License
MIT

[Back to top](#readme-contents)

## Questions?
If you have any questions/issues/feature requests, please feel free to open an [issue](https://github.com/JKHeadley/appy/issues/new). We'd love to hear from you!

[Back to top](#readme-contents)

## Contributing
Please reference the contributing doc: https://github.com/JKHeadley/appy/blob/master/CONTRIBUTING.md

[Back to top](#readme-contents)

## Thanks!
We hope you enjoy appy!
