const multiparty = require('multiparty');
const { classifyImage } = require('../services/inferenceService');
const { storePrediction } = require('../services/storeData');
const { v4: uuidv4 } = require('uuid');
const InputError = require('../exceptions/InputError');

const postPredictHandler = async (request, h) => {
  const { image } = request.payload;
  const { model } = request.server.app;
  const result = await classifyImage(model, image);
  const suggestion = result === 'Cancer' ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.';
  const id = uuidv4();
  const data = {
    id: id,
    result: result,
    suggestion: suggestion,
  };
  
  await storePrediction(data);
  const response = h.response({
    status: "success",
    message: "Model is predicted successfully",
    data,
  });
  response.code(201);
  return response;
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
