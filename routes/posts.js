const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const User = require("../models/User");

/*
*   CREATE a post
* */
router.post('/', async (req, res) => {
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    } catch (err) {
        res.status(500).json(err)
    }
})

/*
*   UPDATE a post
* */
router.put('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await post.updateOne({
                $set: req.body
            })
            res.status(200).json('The post has been updated.')
        } else {
            res.status(403).json('You can only update your post.')
        }
    } catch (err) {
        res.status(500).json(err)
    }
})

/*
*   DELETE a post
* */
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await post.deleteOne()
            res.status(200).json('Post deleted.')
        } else {
            res.status(403).json('You can only delete your post.')
        }
    } catch (err) {
        res.status(500).json(err)
    }
})

/*
*   LIKE / DISLIKE a post
* */
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({
                $push: {likes: req.body.userId}
            })
            res.status(200).json('The post has been liked.')
        } else {
            await post.updateOne({
                $pull: {likes: req.body.userId}
            })
            res.status(200).json('The post has been disliked.')
        }
    } catch (err) {
        res.status(500).json(err)
    }
})

/*
*   GET a post
* */
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)
    } catch (err) {
        res.status(500).json(err)
    }
})

/*
*   GET timeline posts
* */
router.get('/timeline/:username', async (req, res) => {
    try {
        const user = await User.findOne({username: req.params.username})
        const userPosts = await Post.find({userId: user._id})
        const friendPosts = await Promise.all(
            user.followings.map(friendId => {
                return Post.find({userId: friendId})
            })
        )
        res.status(200).json(userPosts.concat(...friendPosts))
    } catch (err) {
        res.status(500).json(err)
    }
})

/*
*   GET user's posts
* */
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({username: req.params.username})
        const posts = await Post.find({userId: user._id})
        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = router