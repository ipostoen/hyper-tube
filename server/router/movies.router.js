const express = require('express');
const movie = require('../components/movie/movie');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.route('/:id').get(movie.getFilm);
router.route('/stream/:magnet').get(movie.getStream);


module.exports = router;