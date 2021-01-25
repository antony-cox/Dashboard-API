const AuthController = require('./auth.controller');
const express = require('express');
const router = express.Router();

router.post('/', function(req, res, next) {
  AuthController.login(req, res, next);
})

module.exports = router;