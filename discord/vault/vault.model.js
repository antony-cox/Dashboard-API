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