const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')

/*
*   UPDATE a user
* */
router.put('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        // update the password
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch (err) {
                res.status(500).json(err)
            }
        }
        // update other things in req.body
        try {
            await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            })
            res.status(200).json('Account has been updated successfully.')
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json('You can only update your account.')
    }
})

/*
*   DELETE a user
* */
router.delete('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json('Account has been deleted.')
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json('You can only delete your account.')
    }
})

/*
*   GET a user
* */
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        // password and updatedAt will not be sent to renderer
        const {password, updatedAt, ...other} = user._doc
        res.status(200).json(other)
    } catch (err) {
        res.status(500).json(err)
    }
})

/*
*   FOLLOW a user
* */
router.put('/:id/follow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id) // currentUser will follow this user
            const currentUser = await User.findById(req.body.userId)
            if (!user.followers.includes(req.body.userId)) {
                // add currentUser to user's followers list
                await user.updateOne({
                    $push: {followers: req.body.userId}
                })
                // add user to currentUser's followings list
                await currentUser.updateOne({
                    $push: {followings: req.params.id}
                })
                res.status(200).json('User has been followed.')
            } else {
                res.status(403).json('You already followed this user.')
            }
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json('You cant follow yourself.')
    }
})

/*
*   UNFOLLOW a user
* */
router.put('/:id/unfollow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id) // currentUser will follow this user
            const currentUser = await User.findById(req.body.userId)
            if (user.followers.includes(req.body.userId)) {
                // add currentUser to user's followers list
                await user.updateOne({
                    $pull: {followers: req.body.userId}
                })
                // add user to currentUser's followings list
                await currentUser.updateOne({
                    $pull: {followings: req.params.id}
                })
                res.status(200).json('User has been unfollowed.')
            } else {
                res.status(403).json('You dont follow this user.')
            }
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json('You cant unfollow yourself.')
    }
})

module.exports = router;
