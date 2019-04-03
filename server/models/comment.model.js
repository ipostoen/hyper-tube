const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');
const { User } = require('./user.model');

var CommentSchema = new mongoose.Schema({
    comment: String,
    filmId: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

CommentSchema.statics.findByMovieId = async function (id) {
    var comment = this;

    return comment.find({ 'filmId': id }).then((res) => {
        if (!res) {
            return Promise.reject();
        } else {
            return res;
        }
    });
}

var Comment = mongoose.model('Comment', CommentSchema);

module.exports = { Comment };