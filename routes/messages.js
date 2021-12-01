const express = require('express');
const router = express.Router();
const Message = require('../models/Message')

/*
*   Send message
* */
router.post('/', async (req, res) => {
    const newMsg = new Message(req.body)

    try {
        const savedMsg = await newMsg.save()
        res.status(200).json(savedMsg)
    } catch (e) {
        res.status(500).json(e)
    }
})

/*
*   Get message
* */
router.get('/:conversationId', async (req, res) => {
    try {
        const allMsg = await Message.find({
            conversationId: req.params.conversationId
        })
        res.status(200).json(allMsg)
    } catch (e) {
        res.status(500).json(e)
    }
})

module.exports = router;
