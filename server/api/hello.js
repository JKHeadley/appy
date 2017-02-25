'use strict';

module.exports = function (server, mongoose, logger) {
    server.route({
      method: 'GET',
      path: '/hello-world',
      config: {
        handler: function(request, reply) { reply("Hello World") },
        tags: ['api'],
        plugins: {
          'hapi-swagger': {}
        }
      }
    });
};
