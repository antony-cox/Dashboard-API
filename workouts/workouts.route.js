const WorkoutController = require('./workouts.controller');
const express = require('express');
const router = express.Router();
const permission = process.env.workoutPermission;


router.post('/', function(req, res, next) {
  if(hasPermission(req.user)) {
    WorkoutController.get(req, res, next);
  } else {
    res.status(401).send();
  }
});

router.get('/raw', function(req, res, next) {
  if(hasPermission(req.user)) {
    WorkoutController.getRaw(req, res, next);
  } else {
    res.status(401).send();
  }
});

router.get('/processRaw', function(req, res, next) {
  if(hasPermission(req.user)) {
    WorkoutController.processRaw(req, res, next);
  } else {
    res.status(401).send();
  }
});

router.post('/detail', function(req, res, next) {
  if(hasPermission(req.user)) {
    WorkoutController.getDetail(req, res, next);
  } else {
    res.status(401).send();
  }
});

router.post('/sendToIntervals', function(req, res, next) {
  if(hasPermission(req.user)) {
    WorkoutController.sendToIntervals(req, res, next);
  } else {
    res.status(401).send();
  }
});

module.exports = router;

function hasPermission(user)
{
  return user.permissions.includes(permission);
}