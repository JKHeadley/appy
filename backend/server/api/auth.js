'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Chalk = require('chalk');
const Jwt = require('jsonwebtoken');
const Uuid = require('node-uuid');
const RestHapi = require('rest-hapi');

const Config = require('../../config');

const USER_ROLES = Config.get('/constants/USER_ROLES');
const clientURL = Config.get('/clientURL');

module.exports = function (server, mongoose, logger) {
    /**
     * Shared handler for social auth endpoints. First endpoint to hit for social login with web.
     */
    const socialAuthHandler = function (request, reply) {
        const Log = logger.bind(Chalk.magenta("Social Auth"));
        const User = mongoose.model('user');

        if (!request.auth.isAuthenticated) {
            return reply(Boom.unauthorized('Authentication failed: ' + request.auth.error.message));
        }

        // NOTE: this token has a very short lifespan as it should be used immediately under correct conditions
        const token = Jwt.sign({
            username: request.pre.user.username,
            email: request.pre.user.email,
            facebookId: request.pre.user.facebookId,
            key: request.pre.keyHash.key
        }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: "1m" });

        const _id = request.pre.user._id;
        const update = {
            socialLoginHash: request.pre.keyHash.hash,
        };

      Log.debug("request.pre:", request.pre)

        return RestHapi.update(User, _id, update, Log)
            .then(function(user) {
                Log.debug("UPDATED USER:", user)
                const redirectUrl = clientURL + '/login/social';
                return reply.redirect(redirectUrl + '/?token=' + token);
            })
            .catch(function (error) {
                Log.error(error);
                return reply(Boom.gatewayTimeout('An error occurred.'));
            });
    };


    // Facebook Auth Endpoint
    (function () {
        const Log = logger.bind(Chalk.magenta("Facebook Auth"));
        const Session = mongoose.model('session');
        const User = mongoose.model('user');
        const Role = mongoose.model('role');

        Log.note("Generating Facebook Auth endpoint");

        const facebookAuthPre = [
            {
                assign: 'user',
                method: function (request, reply) {

                    const facebookProfile = request.auth.credentials.profile;

                    let user = {};
                    let password = {};

                    //EXPL: if the user does not exist, we create one with the facebook account data
                    User.findOne({ facebookId: facebookProfile.id })
                        .then(function (user) {
                            if (user) {
                                reply(user);

                                throw 'Found User';
                            }
                            else {
                                return RestHapi.list(Role, { name: USER_ROLES.USER }, Log)
                            }
                        })
                        .then(function(role) {
                            role = role.docs[0];

                            password = Uuid.v4();
                            user = {
                                isActive: true,
                                email: facebookProfile.email,
                                firstName: facebookProfile.name.first,
                                lastName: facebookProfile.name.last,
                                password: password,
                                facebookId: facebookProfile.id,
                                role: role._id,
                            };

                            return RestHapi.create(User, user, Log);
                        })
                        .then(function(result) {
                            user = result;

                            user.password = password;

                            return reply(user);
                        })
                        .catch(function (error) {
                            if (error === 'Found User') {
                                return
                            }
                            Log.error(error);
                            return reply(Boom.gatewayTimeout('An error occurred.'));
                        });
                }
            },
            {
                assign: 'keyHash',
                method: function (request, reply) {
                    Session.generateKeyHash(Log)
                        .then(function (result) {
                            return reply(result)
                        })
                        .catch(function (error) {
                            Log.error(error);
                            return reply(Boom.gatewayTimeout('An error occurred.'));
                        });
                }
            }
        ];

        server.route({
            method: 'GET',
            path: '/auth/facebook',
            config: {
                handler: socialAuthHandler,
                auth: 'facebook',
                description: 'Facebook auth.',
                tags: ['api', 'Facebook', 'Auth'],
                validate: {
                },
                pre: facebookAuthPre,
                plugins: {
                    'hapi-swagger': {
                        responseMessages: [
                            { code: 200, message: 'Success' },
                            { code: 400, message: 'Bad Request' },
                            { code: 404, message: 'Not Found' },
                            { code: 500, message: 'Internal Server Error' }
                        ]
                    }
                }
            },
        });
    }());
};
