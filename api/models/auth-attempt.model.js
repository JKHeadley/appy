'use strict';

const Config = require('../../config');

module.exports = function (mongoose) {
    var modelName = "authAttempt";
    var Types = mongoose.Schema.Types;
    var Schema = new mongoose.Schema({
        email: {
            type: Types.String,
            required: true
        },
        ip: {
            type: Types.String,
            required: true
        },
        time: {
            type: Types.Date,
            required: true
        }
    }, { collection: modelName });

    Schema.statics = {
        collectionName:modelName,
        routeOptions: {
            alias: "auth-attempt"
        },
        createInstance: function(ip, email, Log) {

            const document = {
                ip,
                email: email.toLowerCase(),
                time: new Date()
            };

            return mongoose.model('authAttempt').create(document)
                .then(function(docs) {
                    return docs;
                })
        },

        abuseDetected: function(ip, email, Log) {

            const self = this;
            let abusiveIpCount = {},
                abusiveIpUserCount = {};

            const query = { ip };
            return self.count(query)
                .then(function(result) {
                    abusiveIpCount = result;

                    const query = {
                        ip,
                        email: email.toLowerCase()
                    };

                    return self.count(query);
                })
                .then(function(result) {
                    abusiveIpUserCount = result;

                    const authAttemptsConfig = Config.get('/authAttempts');
                    const ipLimitReached = abusiveIpCount >= authAttemptsConfig.forIp;
                    const ipUserLimitReached = abusiveIpUserCount >= authAttemptsConfig.forIpAndUser;

                    return (ipLimitReached || ipUserLimitReached);
                })
        }
    };

    return Schema;
};
