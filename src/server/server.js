const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const dotenv = require('dotenv');
require('dotenv').config();


dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    routes: {
      payload: {
        maxBytes: 1000000,
        output: 'stream',
        parse: true,
        multipart: true,
      },
    },
  });

  server.route(routes);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response.isBoom) {
      console.error('Unhandled Error:', response);
      return h.response({
        status: 'fail',
        message: response.message || 'Internal Server Error',
      }).code(response.output.statusCode);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

init();