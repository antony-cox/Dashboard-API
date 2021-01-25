const LeaderboardController = require('./leaderboard.controller');
const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    LeaderboardController.get(req, res, next);
});

router.post('/refresh', function(req, res, next) {
    LeaderboardController.refresh(req, res, next);
});

router.post('/scrape', function(req, res, next) {
    LeaderboardController.scrape(req, res, next);
});

module.exports = router;