var wellknown = require('nodemailer-wellknown');
var nodemailer = require('nodemailer');

var smtpConfig = {
	host: 'xxx',
	port: 465,
	auth : {
		user : 'xxx',
		pass : 'xxx'
	}
}
var transporter = nodemailer.createTransport(smtpConfig);
module.exports = function(toList, subject, text, html) {

	var mailOptions = {
		from : '"Open Activity" <one.activity@yahoo.com>', // sender address
		to : toList.join(), // list of receivers
		subject : '[Open Activity]'+subject, // Subject line
		text : text, // plaintext body
		html : html // html body
	};
	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.error("send failed");
			return console.error(error);
		}
		console.log("message send to "+toList.join());
		console.log('Message sent: ' + info.response);
	});
}
