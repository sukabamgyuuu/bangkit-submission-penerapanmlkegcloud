const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const dotenv = require('dotenv');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');
require('dotenv').config();


dotenv.config();
const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 8080,
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
  const model = await loadModel()
  server.app.model = model
  server.route(routes);
  server.ext('onPreResponse', function (request, h)  {
    const response  = request.response;
    if (response instanceof InputError) {
      const newResponse = h.response({
        status: "fail",
        message: `Terjadi kesalahan dalam melakukan prediksi`,
      });
      newResponse.code(400);
      return newResponse;
    }
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
