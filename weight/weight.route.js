const WeightController = require('./weight.controller');
const express = require('express');
const router = express.Router();
const permission = process.env.weightPermission;


router.get('/', function(req, res, next) {
  if(hasPermission(req.user)) {
    WeightController.get(req, res, next);
  } else {
    res.status(401).send();
  }
});

router.post('/add', function(req, res, next) {
  if(hasPermission(req.user)) {
    WeightController.add(req, res, next);
  } else {
    res.status(401).send();
  }
});

module.exports = router;

function hasPermission(user)
{
  return user.permissions.includes(permission);
}