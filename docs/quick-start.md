---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
---

![appy-dashboard](https://user-images.githubusercontent.com/12631935/39155220-f691c77e-4705-11e8-9b83-2129a07c6d35.png)

## Requirements

Just [Docker](https://docs.docker.com/install)

**OR**

You need [Node.js](https://nodejs.org/en/) installed (>=12.14.1) and you'll need [MongoDB](https://docs.mongodb.com/manual/installation/) installed and running.


## Getting Started

Download from GitHub:

```bash
$ git clone https://github.com/JKHeadley/appy.git
$ cd appy
```

## Using Docker

> **NOTE**: Docker commands might take some time on the first build. After the first build they
> should be relatively quick.

Rename `backend/.env-docker-sample` to `backend/.env-docker` and update any secrets or keys as needed (this is not
required, but at minimum providing a valid `IPSTACK_ACCESS_KEY` will allow for proper dashboard
data). **Never commit .env-docker to your repo**

Also, update values in `backend/config/index.js` as needed.

Seed the db with data (only required once):

```bash
$ sh seed_data.sh
```
 
Once seeding is done, run the app:

```bash
$ sh run_app.sh
```

Point your browser to http://localhost:3000/ to view the app, http://localhost:8080/ to view the swagger API docs, or click on one of the test accounts below to login:

> **NOTE**: Password for all seed users is `root`.

**<a href="http://localhost:3000/login?email=test@user.com&password=root" target="_blank">User</a>**

**<a href="http://localhost:3000/login?email=test@admin.com&password=root" target="_blank">Admin</a>**

**<a href="http://localhost:3000/login?email=test@superadmin.com&password=root" target="_blank">Super Admin</a>**


...that's it, have fun!

## Without Docker

Install dependencies:

#### Backend

``` bash
$ cd backend
$ npm install
```

#### Frontend

``` bash
$ cd frontend
$ npm install
```

### Backend Configuration
Rename `.env-sample` to `.env` and update any secrets or keys as needed (this is not
required, but at minimum providing a valid `IPSTACK_ACCESS_KEY` will allow for proper dashboard
data). **Never commit .env to your repo**

Also, update values in `backend/config/index.js` as needed.

### First time setup
**WARNING**: This will clear all data in the MongoDB database defined in ``restHapiConfig.mongo.URI`` (default ``mongodb://localhost/appy``).

To seed your database with some data, run:

```
$ npm run seed
```

> **NOTE**: The password for all seed users is ``root``.

### Running appy

#### Backend

``` bash
$ npm run start
```

Point your browser to http://localhost:8080/ to view the Swagger docs.

#### Frontend

``` bash
$ npm run start
```

Point your browser to http://localhost:3000/ to view the app, or click on one of the test accounts below to login:

**<a href="http://localhost:3000/login?email=test@user.com&password=root" target="_blank">User</a>**

**<a href="http://localhost:3000/login?email=test@admin.com&password=root" target="_blank">Admin</a>**

**<a href="http://localhost:3000/login?email=test@superadmin.com&password=root" target="_blank">Super Admin</a>**


...have fun!
