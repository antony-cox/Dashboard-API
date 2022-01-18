const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']
    if (token == null) res.sendStatus(401)

    jwt.verify(token, process.env.tokenKey, function(err, user) {
        if (err)
        {
            res.status(403).send(err);
        } else {
            req.user = user;
            next();
        }
    })
}