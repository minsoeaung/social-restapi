const jwt = require('jsonwebtoken')

exports.refreshTokens = [];

exports.generateAccessToken = (username) => {
    return jwt.sign({username}, process.env.TOKEN_SECRET, {expiresIn: '24h'});
}

exports.generateRefreshToken = (username) => {
    return jwt.sign({username}, process.env.TOKEN_REFRESH_SECRET);
}

exports.verifyUser = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err)
                return res.status(403).json("Token is not valid!");

            req.user = user;
            // all fine, go to next
            next();
        })
    } else {
        res.status(401).json("You are not authenticated!");
    }
};