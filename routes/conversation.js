const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation')

/*
*   Create a new conversation
* */
router.post('/', async (req, res) => {
    const newConv = new Conversation({
        members: [req.body.senderId, req.body.receiverId]
    })

    try {
        const savedConv = await newConv.save()
        res.status(200).json(savedConv)
    } catch (e) {
        res.status(500).json(e)
    }
})

/*
*   Get all conversations of a user
* */
router.get('/:userId', async (req, res) => {
    try {
        const conv = await Conversation.find({
            members: {$in: [req.params.userId]}
        })
        res.status(200).json(conv)
    } catch (e) {
        res.status(500).json(e)
    }
})

/*
*   Get conversation of two specific person
* */
router.get('/find/:firstUserId/:secondUserId', async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            members: {
                $all: [req.params.firstUserId, req.params.secondUserId]
            }
        })
        res.status(200).json(conversation)
    } catch (e) {
        res.status(500).json(e)
    }
})

module.exports = router;
