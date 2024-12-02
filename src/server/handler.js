const multiparty = require('multiparty');
const { classifyImage } = require('../services/inferenceService');
const { storePrediction } = require('../services/storeData');
const { v4: uuidv4 } = require('uuid');
const InputError = require('../exceptions/InputError');

const postPredictHandler = async (request, h) => {
  const form = new multiparty.Form();

  return new Promise((resolve, reject) => {
    form.parse(request.payload, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        reject(h.response({
          status: 'fail',
          message: 'Invalid file format',
        }).code(415));
      }

      const file = files.image?.[0];
      if (!file) {
        console.error('No file uploaded');
        reject(h.response({
          status: 'fail',
          message: 'File is required',
        }).code(400));
      }

      if (file.size > 1000000) {
        resolve(h.response({
          status: 'fail',
          message: 'Payload content length greater than maximum allowed: 1000000',
        }).code(413));
      }

      try {
        console.log('Classifying image...');
        const result = await classifyImage(file);
        const suggestion = result === 'Cancer' ? 'Segera periksa ke dokter!' : 'Anda sehat!';
        const id = uuidv4();

        console.log('Storing prediction...');
        const savedData = await storePrediction(id, result, suggestion);

        resolve(h.response({
          status: 'success',
          message: 'Model is predicted successfully',
          data: savedData,
        }).code(201));
      } catch (error) {
        console.error('Error during prediction process:', error);
        resolve(h.response({
          status: 'fail',
          message: 'Terjadi kesalahan dalam melakukan prediksi',
        }).code(500));
      }
    });
  });
};

const getHistoryHandler = async (request, h) => {
  try {
    const collection = firestore.collection(process.env.FIRESTORE_COLLECTION);
    console.log('Fetching prediction histories from Firestore...');

    const snapshots = await collection.get();
    const data = snapshots.docs.map(doc => ({
      id: doc.id,
      history: doc.data(),
    }));

    // Jika data kosong, kembalikan array kosong
    if (data.length === 0) {
      console.log('No history found.');
    }

    return {
      status: 'success',
      data: data,
    };
  } catch (error) {
    console.error('Error fetching histories:', error);
    return h.response({
      status: 'fail',
      message: 'Error fetching histories from Firestore',
    }).code(500);
  }
};


module.exports = { postPredictHandler, getHistoryHandler };