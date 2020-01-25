function changelog(msg, args) {
	if (args.length != 0) {
		getRepoData(msg, args[0]);
		return;
	}
	getRepoData(msg);
}

module.exports = {
	changelog: changelog
}