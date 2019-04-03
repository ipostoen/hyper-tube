const _ = require('lodash');
const { User } = require('../../models/user.model');
const mail = require('../../service/mail/mail');
const gen = require('../../middleware/genPassword');

var registerUser = async function (req, res) {
    var body = _.pick(req.body, ['username', 'lastname', 'firstname', 'email', 'password']);
    body.service = 'hypertube';
    body.confirm = false;
    var user = new User(body);

    try {
        let token = await user.generateTmpToken();
        await mail.sendConfirmEmail(user.email, `${process.env.SERVER_URL}api/user/confirm/` + token);
        res.status(200).send(user);
    } catch (e) {
        if (e.code === 11000) {
            var field = e.errmsg.split("index: ")[1];
            field = field.split(" dup key")[0];
            field = field.substring(0, field.lastIndexOf("_"));
            res.status(400).send({
                code: 11000,
                index: field
            });
        } else {
            console.log('ERROR:  ', e);
            res.status(400).send(e);
        }
    }
}

var confirmRegister = async (req, res) => {
    let token = req.params.token;

    try {
        var user = await User.findByTmpToken(token);
        if (user.confirm === false) {
            await user.accessAcount();
        }
        res.send('Success');
    } catch (e) {
        res.status(400).send(e);
    }

}

var newTmpToken = async function (req, res) {
    var body = _.pick(req.body, ['email']);

    try {
        var user = await User.findByEmail(body.email);
        let token = await user.generateTmpToken();
        await mail.sendConfirmEmail(user.email, `${process.env.SERVER_URL}api/user/confirm/` + token);
        res.send({ text: 'Success' });
    } catch (e) {
        console.log('ERROR:  ', e);
        res.status(400).send(e);
    }
};

var codePass = async function (req, res) {
    var email = req.body.email;

    try {
        var user = await User.findByEmail(email);
        var code = gen.genPassword();
        await mail.sendCode(user.email, code);
        user.password = code;
        await user.save();
        res.send(user._id);
    } catch (error) {
        console.log('ERROR:  ', error);
        res.status(400).send(error);
    }
}

var refreshPassword = async function (req, res) {
    var body = _.pick(req.body, ['id', 'code', 'password']);

    try {
        var user = await User.findByIdCode(body.id, body.code);
        user.password = body.password;
        await user.save();
        res.send();
    } catch (error) {
        console.log('ERROR:  ', error);
        res.status(400).send(error);
    }
}

var loginUser = (req, res) => {
    var body = _.pick(req.body, ['username', 'password']);

    User.findByCredentials(body.username, body.password).then((user) => {
        if (user.confirm === false) {
            res.status(200).send({ code: 1234, text: "confirm account" })
        } else {
            return user.generateAuthToken().then((token) => {
                res.header('x-auth', token).send(user.toJson());
            });
        }
    }).catch((e) => {
        res.status(400).send(e);
    });
}

var loginUserWithGoogle = (req, res) => {
    var body = _.pick(req.body, ['token', 'name', 'email']);
    let firstname = body.name.split(' ')[0];
    let lastname = body.name.split(' ')[1];
    var user = new User({
        firstname,
        lastname,
        password: '',
        service: 'google',
        username: `${firstname}${lastname}`,
        email: body.email
    });
    user.save().then(() => {
        user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user.toJson());
        });
    }).catch((e) => {
        if (e.code === 11000) {
            User.findByCredentials(`${firstname}${lastname}`, '').then((user) => {
                return user.generateAuthToken().then((token) => {
                    res.header('x-auth', token).send(user.toJson());
                });
            }).catch((e) => {
                res.status(400).send(e);
            });;
        } else {
            res.status(400).send(e);
        }
    });
}

var loginUserWithIntra = (req, res) => {
    let body = _.pick(req, ['email', 'username', 'firstname', 'lastname']);
    body.password = '';
    body.service = 'intra';
    console.log(body);
    let user = new User(body);

    user.save().then(() => {
        user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user.toJson());
        });
    }).catch((e) => {
        if (e.code === 11000) {
            User.findByCredentials(user.username, '').then((user) => {
                return user.generateAuthToken().then((token) => {
                    res.header('x-auth', token).send(user.toJson());
                });
            }).catch((e) => {
                res.status(400).send(e);
            });;
        } else {
            res.status(400).send(e);
        }
    });
}

var logoutUser = (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    loginUserWithGoogle,
    loginUserWithIntra,
    confirmRegister,
    newTmpToken,
    codePass,
    refreshPassword
}