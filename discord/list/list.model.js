const mongoose = require('../../services/mongoose').mongoose;
const Schema = mongoose.Schema;

const ListModel = new Schema({
  title: {type: String, required: true},
  items: {type: [], validate: v => Array.isArray(v) && v.length > 0},
  dateCreated: {type: Date},
  dateUpdated: {type: Date}
});

const List = mongoose.model('List', ListModel);

exports.add = (l) => {
  var list = new List(l);
  return list.save();
}

exports.get = (title) => {
  let query = {};

  query.title = new RegExp('^' + title + '$', 'i');

  return List.findOne(query).select();
}