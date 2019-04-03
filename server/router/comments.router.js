const express = require('express');
const comment = require('../components/comment/comment');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.route('/').post(comment.setComments);
router.route('/:id').get(comment.getComments);


module.exports = router;