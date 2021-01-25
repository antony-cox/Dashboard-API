const mongoose = require('../services/mongoose').mongoose;
const Schema = mongoose.Schema;

const configModel = new Schema({
  permissions: {type: [String], validate: v => Array.isArray(v) && v.length > 0},
  selectors: {type: Object},
  athletes: {type: [String], validate: v => Array.isArray(v) && v.length > 0},
});

const Config = mongoose.model('Config', configModel);

exports.add = (configData) => {
  var config = new Config(configData);
  return config.save();
}

exports.get = () => {
  return Config.findOne();
}

function formatSelect(results)
{
  return results.select('-_id -__v');
}