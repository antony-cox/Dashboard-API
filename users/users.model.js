const mongoose = require('../services/mongoose').mongoose;
const Schema = mongoose.Schema;

const userModel = new Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  permissions: {type: [String], validate: v => Array.isArray(v) && v.length > 0},
  intervalsId: {type: String, required: false},
  intervalsKey: {type: String, required: false},
  active: {type: Boolean}
});

const User = mongoose.model('Users', userModel);

exports.save = (userData) => {
  const user = new User(userData);
  return user.save();
};

exports.list = () => {
  return User.find().select('email');
};

exports.getByEmail = (email) => {
  return User.findOne({email: email}).select('-_id -__v -password');
};

exports.getById = (id) => {
  return User.findOne({_id: id}).select('-__v');
};

exports.login = (email, password) => {
  return User.findOne({email: email, password: password});
}