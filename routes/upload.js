const express = require('express');
const router = express.Router();
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/post')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})
const upload = multer({storage})

router.post('/', upload.single('file'), (req, res) => {
    try {
        res.status(200).json('file upload success')
    } catch (e) {
        console.log(e)
    }
})

module.exports = router