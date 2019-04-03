"use strict";
require('../../config/config');
const path = require('path');

const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');

let mailer = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_PASS
	}
});
mailer.use('compile', hbs({
	viewEngine: {
		extname: '.hbs',
		layoutsDir: path.join(__dirname, "view"),
		partialsDir : path.join(__dirname, "view")
	},
	viewPath: path.join(__dirname, "view"),
	extName: '.hbs',
	
}));


var sendConfirmEmail = async function (to, link) {
	let mailOptions = {
		from: '"Fred Foo 👻" <huper>',
		to,
		subject: "Confirm Email - Hupertube",
		template: 'confirmEmail',
		context: {
			link
		}
	};

	mailer.sendMail(mailOptions, (err, info) => {
		if (err) {
			Promise.reject(err);
		}
		return info;
	});
}

var sendCode = async function (to, code) {
	let mailOptions = {
		from: '"Fred Foo 👻" <huper>',
		to,
		subject: "Confirm Email - Hupertube",
		template: 'sendCode',
		context: {
			code
		}
	};

	mailer.sendMail(mailOptions, (err, info) => {
		if (err) {
			Promise.reject(err);
		}
		return info;
	});
}

module.exports = {
	sendConfirmEmail,
	sendCode
};