const express = require('express');
const router = express.Router();
const User = require('../models/User')

// REGISTER
router.get('/register', async (req, res) => {

    // constructing documents ( an instance of a model )
    const user = await new User({
        username: "John",
        email: "john@gmail.com",
        password: "123456"
    })

    await user.save()

    res.send("ok")
});

module.exports = router;
