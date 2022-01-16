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

const WorkoutRawModel = new Schema({
  link: {type: String, required: true},
  name: {type: String},
  description: {type: String},
  tss: {type: String},
  category: {type: String},
  data: {type: [], validate: v => Array.isArray(v) && v.length > 0},
  dateCreated: {type: Date}
});

const Workout = mongoose.model('Workout', WorkoutModel);
const WorkoutRaw = mongoose.model('WorkoutRaw', WorkoutRawModel);

exports.add = (w) => {
  var workout = new Workout(w);
  return workout.save();
}

exports.addRaw = (w) => {
  var workoutRaw = new WorkoutRaw(w);
  return workoutRaw.save();
}

exports.get = (category, name, tssLow, tssHigh) => {
  let query = {};

  if (category != null && category != '')
  {
    query.category = new RegExp('^' + category + '$', 'i');
  }

  if (name != null && name != '')
  {
    query.name = new RegExp(name, 'i');
  }

  query.tss = { $gte: tssLow, $lt: tssHigh };

  return formatSelect(Workout.find(query));
}

exports.getRaw = (name) => {
  let query = {};

  if (name != null && name != '')
  {
    query.name = new RegExp('^' + name + '$', 'i');;
  }

  return formatSelect(WorkoutRaw.findOne(query));
}

exports.getAllRaw = () => {
  return formatSelect(WorkoutRaw.find());
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