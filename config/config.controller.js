const ConfigModel = require('./config.model');

exports.add = (req, res, next) => {
    ConfigModel.get()
    .then((result) => {  

        if(result)
        {
            result.permissions = req.body.permissions;
            console.log(result);
        } else {
            result = req.body;    
        }

        ConfigModel.add(result)
        .then((result) => {  
            res.status(201).send(result.permissions);
        })
        .catch((err) => {
            next(err);
        });
    })
    .catch((err) => {
        next(err);
    });
};

exports.get = (req, res, next) => {
    ConfigModel.get()
    .then((result) => {  
        res.status(201).send(result.permissions);
    })
    .catch((err) => {
        next(err);
    });
}

exports.getLeaderboardConfig = () => {
    return ConfigModel.get()
    .then((result) => {

        let lb = {
            selectors: result.selectors,
            athletes: result.athletes,
            login: result.login,
            password: result.password
        };

        return lb;
    })
}