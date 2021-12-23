const https = require('https');
const fs = require("fs");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const router = express.Router();
const app = express();
const auth = require('./middleware/auth');
const helmet = require('helmet');
const compression = require('compression');

require('dotenv').config();

app.use(morgan('combined'));
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

app.use(compression()); //Compress all routes

//AUTH ROUTES
var authRouter = require('./auth/auth.route');
app.use('/auth', authRouter);

//LEADERBOARD ROUTES
var leaderboardRouter = require('./leaderboard/leaderboard.route');
app.use('/leaderboard', leaderboardRouter);

//CONFIG ROUTES
var configRouter = require('./config/config.route');
app.use('/config', auth.authenticateToken, configRouter);

//USERS ROUTES
var usersRouter = require('./users/users.route');
app.use('/users', auth.authenticateToken, usersRouter);

//WEIGHT ROUTES
var weightRouter = require('./weight/weight.route');
app.use('/weight', auth.authenticateToken, weightRouter);

//TRAINERROAD
var workoutsRouter = require('./workouts/workouts.route');
app.use('/workouts', auth.authenticateToken, workoutsRouter);

//INDEX ROUTE
app.use('/', function(req, res, next) {
  res.send('homeDash API');
});

//START SERVER HTTPS
// const options = {
//   key: fs.readFileSync("/etc/letsencrypt/live/tonny.icu/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/tonny.icu/fullchain.pem")
// };

// https.createServer(options, app).listen(3001);
app.listen(3000);