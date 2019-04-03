
var genPassword = function () {
    var length = 7;
    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var password = '';

    for (var i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }

    return password;
}

module.exports = {
    genPassword
}