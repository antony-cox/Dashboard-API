const UserModel = require('../users/users.model');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

exports.login = (req, res, next) => {
    var email = req.body.email
    var pw = req.body.password

    if(email && pw)
    {
        pw = crypto.createHmac('sha512', process.env.salt).update(pw).digest("base64");
        UserModel.login(email, pw)
        .then((result) => {
            if(result)
            {
                if(result.active) {
                    var payload = { 
                        email: result.email, 
                        permissions: result.permissions
                    }
                    var token = jwt.sign(payload, process.env.tokenKey);
                    res.json({
                        _id: result._id, 
                        email: result.email, 
                        intervalsId: result.intervalsId, 
                        intervalsKey: result.intervalsKey,
                        ftp: result.ftp,
                        weight: result.weight,
                        permissions: result.permissions, 
                        token: token
                    });
                } else {
                    res.status(401).send('User inactive.');       
                }
            } else {
                res.status(401).send('Invalid user details.');
            }
        });
    } else {
        res.status(500).send('Invalid payload.')
    }
}

exports.register = (req, res, next) => {
    req.body.password = crypto.createHmac('sha512', process.env.salt).update(req.body.password).digest("base64");
    req.body.active = false;

    UserModel.getByEmail(req.body.email)
        .then((result) => {
            if (result == null)
            {
                UserModel.save(req.body)
                    .then((result) => {  
                        res.status(201).send({id: result._id});
                    })
                    .catch((err) => {
                        next(err);
                    });
            } else {
                next('User already exists.');
            }
        })
        .catch((err) => {
            next(err);
        });
};
