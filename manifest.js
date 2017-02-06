'use strict';
const Confidence = require('confidence');
const Config = require('./config');


const criteria = {
    env: process.env.NODE_ENV
};


const manifest = {
    $meta: 'This file defines the server.',
    server: {
        debug: {
            request: ['error']
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port')
    }],
    registrations: [
        {
            plugin: 'hapi-auth-jwt2'
        },
        {
            plugin: './server/mailer'
        },
        {
            plugin: './server/auth'
        },
        {
            plugin: './server/api'
        }
    ]
};


const store = new Confidence.Store(manifest);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
