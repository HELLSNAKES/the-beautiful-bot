var nodemailer = require('nodemailer'); 

var transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
    secure: true,
	auth: {
		type: 'OAuth2',
		clientId: process.env.clientId,
		clientSecret: process.env.clientSecret,
		refreshToken: process.env.refreshToken
	}
  });
  
  complain();

function complain(msg, args) {
	var mailOptions = {
		from: process.env.email,
		to: 'mooradaltamimi@gmail.com',
		subject: 'Sending Email using Node.js',
		text: 'That was easy!'
	  };
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
		  console.log(error);
		} else {
		  console.log('Email sent: ' + info.response);
		}
	  }); 
}
module.exports = {
	
}