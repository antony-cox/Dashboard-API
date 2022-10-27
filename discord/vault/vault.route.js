const VaultController = require('./vault.controller');
const express = require('express');
const router = express.Router();
const allowedUsers = ['84210359161856000'];

router.post('/', function(req, res, next) {
    if(hasPermission(req.body.id))
    {
        VaultController.get(req, res, next);
    } else {
        res.status(401).send();
    }
});

module.exports = router;

function hasPermission(id)
{
  return allowedUsers.includes(id);
}