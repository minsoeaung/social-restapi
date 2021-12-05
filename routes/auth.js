const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')
const authenticate = require('../authenticate')
const jwt = require('jsonwebtoken')


/*
*   Register
* */
router.post('/register', async (req, res) => {
    try {
        // trying not to store plain password in database
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        // new user document (an instance of a model)
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })

        // save user and response
        const user = await newUser.save()
        res.status(200).json(user)

    } catch (err) {
        res.status(500).json(err)
    }
});


/*
*   Login
* */
router.post('/login', async (req, res) => {
    try {
        // check user exists or not
        const user = await User.findOne({email: req.body.email})
        if (!user)
            return res.status(404).send('user not found')

        // check password correct or not
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (validPassword) {
            // prepare tokens
            const accessToken = authenticate.generateAccessToken(user)
            const refreshToken = authenticate.generateRefreshToken(user)
            authenticate.refreshTokens.push(refreshToken)

            // 200 response
            const {password, updatedAt, ...other} = user._doc
            res.status(200).json({...other, accessToken, refreshToken})
        } else {
            res.status(400).send('wrong password')
        }
    } catch (err) {
        res.status(500).json(err)
    }
})


/*
*   Logout
* */
router.post("/logout", authenticate.verifyUser, (req, res) => {
    const refreshToken = req.body.token;
    authenticate.refreshTokens = authenticate.refreshTokens.filter((token) => token !== refreshToken);
    res.status(200).json("Logout success");
});


/*
*   Refresh Token
* */
router.post("/refreshToken", (req, res) => {
    // check refresh token from user
    const refreshToken = req.body.token
    if (!refreshToken)
        return res.status(401).json("You are not authenticated!")

    // check refresh token is correct or not
    if (!authenticate.refreshTokens.includes(refreshToken))
        return res.status(403).json("Refresh token is not valid!")

    jwt.verify(refreshToken, process.env.TOKEN_REFRESH_SECRET, (err, user) => {
        if (err) console.log(err)
        authenticate.refreshTokens = authenticate.refreshTokens.filter((token) => token !== refreshToken)

        const newAccessToken = authenticate.generateAccessToken(user)
        const newRefreshToken = authenticate.generateRefreshToken(user)

        authenticate.refreshTokens.push(newRefreshToken)

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        })
    })
})

module.exports = router;
