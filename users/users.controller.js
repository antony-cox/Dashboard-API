const UserModel = require('./users.model');
const crypto = require('crypto');
const adminPermission = process.env.adminPermission;

exports.get = (req, res, next) => {
    UserModel.list()
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((err) => {
            next(err);
        })
};

exports.getByEmail = (req, res, next) => {
    if(req.body.email)
    {
        UserModel.getByEmail(req.body.email)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((err) => {
            next(err);
        })
    } else {
        next('No user found.');
    }   
}

exports.getById = (req, res, next) => {
    if(req.body._id)
    {
        UserModel.getById(req.body._id)
        .then((result) => {
            result.password = '';
            res.status(200).send(result);
        })
        .catch((err) => {
            next(err);
        })
    } else {
        next('No user found.');
    }   
}

exports.update = (req, res, next) => {
    var newUser = req.body

    if(newUser._id)
    {
        UserModel.getById(newUser._id)
        .then((result) => {
            if(req.user.permissions.includes(adminPermission))
            {
                result.email = newUser.email;
                result.intervalsId = newUser.intervalsId;
                result.intervalsKey = newUser.intervalsKey;
                result.ftp = newUser.ftp;
                result.weight = newUser.weight;

                if(newUser.password) {
                    result.password = crypto.createHmac('sha512', process.env.salt).update(newUser.password).digest("base64");
                }

                result.permissions = newUser.permissions;
                result.active = newUser.active;
            } else if (req.user.email === result.email) {
                result.email = newUser.email;
                result.intervalsId = newUser.intervalsId;
                result.intervalsKey = newUser.intervalsKey;
                result.ftp = newUser.ftp;
                result.weight = newUser.weight;
                result.active = newUser.active;

                if(newUser.password) {
                    result.password = crypto.createHmac('sha512', process.env.salt).update(newUser.password).digest("base64");
                };
            }

            UserModel.save(result)
            .then((result) => {
                res.status(200).send();
             })
            .catch((err) => {
                next(err);
            })
        })
        .catch((err) => {
            next(err);
        })
    } else {
        next('No user found.');
    }   
}