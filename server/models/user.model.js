const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    lastname: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        // required: true,
    },
    service: {
        type: String
    },
    confirm: {
        type: Boolean
    },
    tmpToken: {
        type: String
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJson = function () {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email', 'password', 'firstname', 'lastname', 'username', 'service']);
};

UserSchema.methods.accessAcount = function (token) {
    var user = this;

    return user.updateOne({
        confirm: true,
        tmpToken: ''
    });
}

UserSchema.methods.generateTmpToken = function () {
    var user = this;
    var token = jwt.sign({ _id: user._id.toHexString() }, process.env.JWT_SECRET).toString();

    user.tmpToken = token;

    return user.save().then(() => {
        return token;
    });
}

UserSchema.statics.findByTmpToken = function (token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject('decoded eroor');
    }


    return User.findOne({
        '_id': decoded._id,
        'tmpToken': token
    }).then((user) => {
        if (!user) {
            return Promise.reject();
        } else {
            return user;
        }
    });
}

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

    user.tokens = user.tokens.concat([{ access, token }]);

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;

    return user.updateOne({
        $pull: {
            tokens: { token }
        }
    })
};

UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByEmail = function (email) {
    var User = this;

    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        } else {
            return user;
        }
    });
}

UserSchema.statics.findByIdCode = function (id, code) {
    var User = this;

    return User.findOne({ _id: id }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(code, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject('code');
                }
            });
        });
    });
}

UserSchema.statics.findByCredentials = function (username, password) {
    var User = this;

    return User.findOne({ username }).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject({ error: 'password' });
                }
            });
        });
    });
};

UserSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = { User };