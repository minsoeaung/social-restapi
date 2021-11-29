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
router.get('/', async (req, res) => {
    const userId = req.query.userId
    const username = req.query.username
    try {
        const user = userId
            ? await User.findById(userId)
            : await User.findOne({username: username})
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

/*
*   Get followings list of a user
* */
router.get('/followings/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        const followings = await Promise.all(
            user.followings.map(id => (
                User.findById(id)
            ))
        )
        let followingList = []
        followings.map(user => {
            const {_id, username, email, profilePicture} = user
            followingList.push({_id, username, email, profilePicture})
        })
        res.status(200).json(followingList)
    } catch (e) {
        res.status(500).json(e)
    }
})

/*
*   Get followers list of a user
* */
router.get('/followers/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        const followers = await Promise.all(
            user.followers.map(id => (
                User.findById(id)
            ))
        )
        let followerList = []
        followers.map(user => {
            const {_id, username, email, profilePicture} = user
            followerList.push({_id, username, email, profilePicture})
        })
        res.status(200).json(followerList)
    } catch (e) {
        res.status(500).json(e)
    }
})

module.exports = router;
