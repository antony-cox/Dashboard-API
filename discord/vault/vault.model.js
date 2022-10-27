const mongoose = require('../../services/mongoose').mongoose;
const Schema = mongoose.Schema;

const vaultModel = new Schema({
  id: {type: String},
  username: {type: String},
  timestamp: {type: Number},
  name: {type: String},
  url: {type: String},
  channel: {type: String},
  content: {type: String}
});

const Vault = mongoose.model('Vault', vaultModel);

exports.add = (vaultData) => {
    var vault = new Vault(vaultData);
    return vault.save();
}

exports.getCount = (channel) => {
  let query = {};

  if (channel != null && channel != '')
  {
    query.channel = new RegExp(channel, 'i');
  }

  return Vault.find(query).countDocuments();
}

exports.get = (channel) => {
  let query = {};

  if (channel != null && channel != '')
  {
    query.channel = new RegExp(channel, 'i');
  }

  return formatSelect(Vault.find(query));
}

function formatSelect(results)
{
  return results.select('-__v');
}