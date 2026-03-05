const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/jwt');

function authenticateToken(req, res, next) {

    const token = req.cookies.token;   // read token from cookie

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {

        if (err) {
            return res.status(403).json({ message: "Token expired or invalid" });
        }

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;