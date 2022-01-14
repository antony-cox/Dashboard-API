const ConfigController = require('./config.controller');
const express = require('express');
const router = express.Router();
const permission = process.env.adminPermission;

router.get('/', function(req, res, next) {
  ConfigController.get(req, res, next);
});

router.post('/add', function(req, res, next) {
  if(hasPermission(req.user)) {
    ConfigController.add(req, res, next);
  } else {
    res.status(401).send();
  }
});

router.get('/getLeaderboardDate', function(req, res, next) {
  ConfigController.getLeaderboardDate(req, res, next);
});

module.exports = router;

function hasPermission(user)
{
  return user.permissions.includes(permission);
}