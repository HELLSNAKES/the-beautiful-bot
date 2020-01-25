
function log(msg, errCode) {
	if (errCode == 4041) {
		console.log('Error 4041');
		msg.channel.send('**Unknown username!** This username doesn\'t seem to exist, check if you spelled the name correctly');
	} else if (errCode == 4042) {
		console.log('Error 4042');
		msg.channel.send('**Unknown beatmap!** Sadly I couldn\'t find the map your are searching for :(, check if you spelled the name of the beatmap correctly');
	} else if (errCode == 4043) {
		console.log('Error 4043');
		msg.channel.send('File is not recognised\nCheck if the file is uploaded coreectly, it  is a json file and isn\'t corrupted');
	} else if (errCode == 4044) {
		console.log('Error 4044');
		msg.channel.send('There were no recent plays in the last 24h or Invalid username\nCheck if you spelled the name correctly or click some circles :)');
	} else if (errCode == 4045) {
		console.log('Error 4045');
		msg.channel.send('**Command arguments are badly formatted**. Please use the commands in this format `$command -a -b 10 -c Username`.\nMake sure that the Username goes last.');
	} else if (errCode == 4046) {
		msg.channel.send('I could not find you/user in the Database. Use the command `$osuset [Your osu username]` to link your osu account.');

	} else {
		console.log('Error 4040');
		msg.channel.send('Error 4040');
	}
}

module.exports = {
	log:log
};