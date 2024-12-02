const { postPredictHandler, getHistoryHandler } = require('./handler');

const routes = [
    {
      method: 'POST',
      path: '/predict',
      handler: postPredictHandler,
      options: {
        payload: {
          output: 'stream', // Gunakan stream agar file dapat diterima
          parse: true,
          multipart: true,
          allow: 'multipart/form-data',
          maxBytes: 1000000, // Ukuran maksimal file 1MB
        },
      },
    },
    {
      method: 'GET',
      path: '/predict/histories',
      handler: getHistoryHandler,
    },
  ];
  
  module.exports = routes;  