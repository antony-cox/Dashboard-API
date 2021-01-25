const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']
    if (token == null) res.sendStatus(401)

    jwt.verify(token, process.env.tokenKey, function(err, user) {
        if (err)
        {
            res.sendStatus(403);
        } else {
            req.user = user;
            next();
        }
    })
}