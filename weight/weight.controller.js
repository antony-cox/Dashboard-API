const WeightModel = require('./weight.model');

exports.add = (req, res, next) => {
    WeightModel.add(req.body)
    .then((result) => {  
        res.status(201).send({id: result._id});
    })
    .catch((err) => {
        next(err);
    });
};

exports.get = (req, res, next) => {
    WeightModel.get()
    .then((result) => {  
        res.status(201).send(result);
    })
    .catch((err) => {
        next(err);
    });
}