const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')

// REGISTER
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

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        !user && res.status(404).send('user not found')

        const validPassword = await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(400).send('wrong password')

        const {password, updatedAt, ...other} = user._doc
        res.status(200).json(other)

    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = router;
