const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY; // change this to something secure

function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email },
        SECRET_KEY,
        { expiresIn: '20m' } // token valid for 20 minutes
    );
}

module.exports = { generateToken, SECRET_KEY };
