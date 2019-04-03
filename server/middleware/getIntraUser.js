const axios = require('axios');
const _ = require('lodash');

var getIntraUser = (req, res, next) => {
    let body = _.pick(req.body, ['code']);
    let param = {
        grant_type: 'authorization_code',
        client_id: process.env.INTRA_CLIENT_ID,
        client_secret: process.env.INTRA_SECRET,
        code: body.code,
        redirect_uri: 'http://localhost:4200/intra'
    }

    axios.post('https://api.intra.42.fr/oauth/token', param).then((res) => {
        if (res) {
            token = `Bearer ${res.data.access_token}`;

            axios.get('https://api.intra.42.fr/v2/me', { 'headers': { Authorization: token } }).then((result) => {
                req.email = result.data.email;
                req.username = result.data.login;
                req.firstname = result.data.first_name;
                req.lastname = result.data.last_name;
                next();
            }).catch((err) => {
                res.status(400).send(err.response.data);
            });
        }
    }).catch((err) => {
        res.status(400).send(err.response.data);
    });
}

module.exports = { getIntraUser };