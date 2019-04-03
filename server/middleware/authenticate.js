var {User} = require('../models/user.model');
const _ = require('lodash');

var authenticate = (req, res, next) => {
    var token = req.header('x_auth');

    if (!token) {
        token = _.pick(req.query, ['x_auth']).x_auth;
    }

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send();
    });
};

module.exports = {authenticate};