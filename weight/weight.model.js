const mongoose = require('../services/mongoose').mongoose;
const Schema = mongoose.Schema;

const weightModel = new Schema({
  weight: {type: Number, required: true},
  date: {type: Date}
});

const Weight = mongoose.model('Weight', weightModel);

exports.add = (weightData) => {
  var weight = new Weight(weightData);
  weight.date = new Date();
  return weight.save();
}

exports.get = () => {
  return formatSelect(Weight.find());
}

function formatSelect(results)
{
  return results.select('-_id -__v');
}