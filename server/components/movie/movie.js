const _ = require('lodash');
const { Comment } = require('../../models/comment.model');
const axios = require('axios');
const torrentStream = require('torrent-stream');


var getTorrent = (id) => axios.get(`https://tv-v2.api-fetch.website/movie/${id}`)
    .then(res => {
        return res.data;
    })
    .catch(err => {
        return Promise.reject(err.response.data);
    });
var getCast = async (id) => {
    let url = `https://api.themoviedb.org/3/movie/${id}/credits`;
    let params = {
        language: 'en-US',
        api_key: 'd96c3ae03928c2015a56ae5119d87782',
    }
    return axios.get(url, { params })
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err.response.data);
        });
}
var getFilmInf = async (id) => {
    let url = `https://api.themoviedb.org/3/movie/${id}`;
    let params = {
        language: 'en-US',
        api_key: 'd96c3ae03928c2015a56ae5119d87782',
        append_to_response: 'videos,images,credits,similar'
    }
    return axios.get(url, { params })
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err.response.data);
        });
}
var getFilm = async (req, res) => {
    try {
        let filmInf = await getFilmInf(req.params.id);
        let torrents = await getTorrent(filmInf.imdb_id);
        let credits = await getCast(req.params.id);
        var result = {
            credits,
            torrents: torrents.torrents,
            backdrop_path: filmInf.backdrop_path,
            grade: filmInf.vote_average,
            title: filmInf.title,
            genres: filmInf.genres,
            overview: filmInf.overview,
            poster_path: filmInf.poster_path,
            similar: filmInf.similar,
            runtime: filmInf.runtime,
            videos: filmInf.videos,
            release_date: filmInf.release_date
        };
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send(error);
    }
};

var getStream = (req, res) => {
    var link = decodeURIComponent(req.params.magnet);
    var engine = torrentStream(link);
    engine.on('ready', function() {
        var stream = engine.files.reduce((file1, file2) => file1.length > file2.length ? file1 : file2);
        var range = req.headers.range ? req.headers.range.substring(6).split('-') : [0, stream.length - 1];
        var start = parseInt(range[0]),
              end   = parseInt(range[1] || stream.length - 1);
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stream.length}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': 'video/mp4'
        });
        
        stream.createReadStream({start: start, end: end}).pipe(res);
    });
}

module.exports = {
    getFilm,
    getStream
}
