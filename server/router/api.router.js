const express = require('express');
const movies = require('./movies.router');
const user = require('./user.router');
const comment = require('./comments.router');
// const confirm = require('./router/confirm.router');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use('/movies', authenticate.authenticate, movies);
router.use('/user', user);
router.use('/comment', authenticate.authenticate, comment);
// router.use('/confirm', confirm);


module.exports = router;