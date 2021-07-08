const mongoose = require('../services/mongoose').mongoose;
const Schema = mongoose.Schema;

const WorkoutModel = new Schema({
  name: {type: String, required: true},
  category: {type: String},
  description: {type: String},
  duration: {type: Number},
  tss: {type: Number},
  data: {type: [], validate: v => Array.isArray(v) && v.length > 0},
  dateCreated: {type: Date}
});

const Workout = mongoose.model('Workout', WorkoutModel);

exports.add = (w) => {
  var workout = new Workout(w);
  return workout.save();
}

exports.get = (category, name) => {
  let query = {};

  if (category != null && category != '')
  {
    query.category = new RegExp('^' + category + '$', 'i');
  }

  if (name != null && name != '')
  {
    query.name = new RegExp(name, 'i');
  }

  return formatSelect(Workout.find(query));
}

exports.getDetail = (id) => {
  return Workout.findOne({_id: id}).select();
};

exports.getByName = (name) => {
  return Workout.findOne({name: name}).select('-__v');
};

function formatSelect(results)
{
  return results.select('-__v');
}