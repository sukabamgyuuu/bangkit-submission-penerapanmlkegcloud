const tf = require('@tensorflow/tfjs-node');
const loadModel = require('./loadModel');
let model;

const classifyImage = async (imageBuffer) => {
  try {
    if (!model) {
      console.log('Loading model...');
      model = await loadModel();
    }

    console.log('Preprocessing image...');
    const tensor = tf.node
      .decodeImage(imageBuffer)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims();

    console.log('Running inference...');
    const predictions = model.predict(tensor).dataSync();
    console.log('Predictions:', predictions);

    return predictions[0] > 0.5 ? 'Cancer' : 'Non-cancer';
  } catch (error) {
    console.error('Error during image classification:', error);
    throw new Error('Failed to classify image');
  }
};

module.exports = { classifyImage };