# appy
A user system leveraging [rest-hapi](https://github.com/JKHeadley/rest-hapi) to bootstrap your app.

appy is a boilerplate user system inspired by the [frame](https://github.com/jedireza/frame) user system that leverages the powerful [rest-hapi](https://github.com/JKHeadley/rest-hapi) API generator.  The goal of appy is to provide a quick to setup and easy to use user system that is also capable of supporting a wide range of applications.  By leveraging [rest-hapi](https://github.com/JKHeadley/rest-hapi), adding new endpoints is as simple as defining a new model, and model associations are a snap.  Bootstrapping your app has never been easier!

## Features

* Registration and account activation flows
* Login system with forgot password and reset password
* Abusive login attempt detection
* User permissions based on roles and groups
* Three optional authentication strategies

## Technologies

appy implements a [hapi](https://github.com/hapijs/hapi) framework server.  appy's RESTful API endpoints are generated through [rest-hapi](https://github.com/JKHeadley/rest-hapi), which means models are based off of [mongoose](https://github.com/Automattic/mongoose) and data is stored in [MongoDB](www.mongodb.org).

## Readme contents
- [Requirements](#requirements)
- [Installation](#installation)
- [First time setup](#first-time-setup)

## Requirements

You need [Node.js](https://nodejs.org/en/) installed and you'll need [MongoDB](https://docs.mongodb.com/manual/installation/) installed and running.

[Back to top](#readme-contents)

## Installation

```
$ git clone git@github.com:JKHeadley/appy.git
$ cd appy
$ npm install
```

[Back to top](#readme-contents)

## Configuration
appy configuration follows frame's configuration flow:

> Simply edit ``config.js``. The configuration uses confidence which makes it easy to manage configuration settings across environments. Don't store secrets in this file or commit them to your repository.

Instead, access secrets via environment variables. We use dotenv to help make setting local environment variables easy (not to be used in production).

Simply copy .env-sample to .env and edit as needed. Don't commit .env to your repository.

### First time setup/Demo
**WARNING**: This will clear all data in the following MongoDB collections (in the db defined in ``restHapiConfig.mongo.URI``, default ``mongodb://localhost/appy``) if they exist: ``user``, ``role``, ``group``, ``permission``, ``session``, and ``authAttempt``.

If you would like to seed your database with some data, run:

```
$ gulp seed
```

NOTE: The password for all seed users is ``root``.

You can use these models as templates for your models or delete them later if you wish.

[Back to top](#readme-contents)
