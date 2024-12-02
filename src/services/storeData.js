const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

const storePrediction = async (id, result, suggestion) => {
  try {
    const collection = firestore.collection(process.env.FIRESTORE_COLLECTION);
    const createdAt = new Date().toISOString();

    console.log('Storing prediction to Firestore...');
    await collection.doc(id).set({
      id,
      result,
      suggestion,
      createdAt,
    });

    console.log('Prediction stored successfully');
    return { id, result, suggestion, createdAt };
  } catch (error) {
    console.error('Error storing prediction to Firestore:', error);
    throw new Error('Failed to store prediction');
  }
};

module.exports = { storePrediction };