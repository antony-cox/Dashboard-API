const UsersController = require('./users.controller');
const express = require('express');
const router = express.Router();
const permission = process.env.adminPermission;

router.get('/', function(req, res, next) {
  if(hasPermission(req.user))
  {
    UsersController.get(req, res, next);
  } else {
    res.status(401).send();
  }
});

router.post('/getByEmail', function(req, res, next) {
  if(hasPermission(req.user))
  {
    UsersController.getByEmail(req, res, next);
  } else {
    res.status(401).send();
  } 
});

router.post('/getById', function(req, res, next) {
  if(hasPermission(req.user))
  {
    UsersController.getById(req, res, next);
  } else {
    res.status(401).send();
  } 
});

router.post('/update', function(req, res, next) {
  if(hasPermission(req.user) || req.user.email === req.body.email) {
    UsersController.update(req, res, next);
  } else {
    res.status(401).send();
  }
});

module.exports = router;

function hasPermission(user)
{
  return user.permissions.includes(permission);
}