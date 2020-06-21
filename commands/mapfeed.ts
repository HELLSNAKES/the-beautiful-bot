import * as database from '../handlers/database';
import * as error from '../handlers/error';
import * as score from '../handlers/score';

const request = require('request');

function execute(client : any) {
	database.read('utility', {}, {useCache: false, noLogs: true}, (docs : any, err : Error) => {
		if (err) {
			error.unexpectedError(err, 'Retriving lastChecked from the database');
			return;
		}
		const lastChecked = docs[0].lastChecked;
		database.read('servers', {}, {useCache: false, noLogs: true},(docs : any, err : any) => {
			if (err) {
				error.unexpectedError(err, 'Error while retriving mapFeedChannelIDs from the database');
				return;
			}

			docs = docs.filter((x : any) => x.mapFeedChannelID != undefined);

			request('https://osu.ppy.sh/beatmapsets/search', {
				json: true
			}, (err : any, res : any, body : any) => {
				// filter plays that are older than lastChecked
				body = body.beatmapsets.filter((x : any) => new Date(x.ranked_date).getTime() > lastChecked);
			
				// Cut down the size of the array to 5 to prevent the bot from spamming maps after going online
				if (body.length >	 5) {
					body = body.slice(0, 5);
				}

				// The body at this point is from newest to oldest. We want to reverse that to oldest to newest
				body.reverse();
				
				for (var i = 0; i < docs.length; i++) {
					for (var j = 0; j < body.length; j++) {
						const embed = {
							'title': `${body[j].artist} - ${body[j].title}`,
							'url': `https://osu.ppy.sh/s/${body[j].id}`,
							'description': `${body[j].status != 'ranked' ? body[j].status != 'loved' ? ':white_check_mark: approved' : ':sparkling_heart: loved' : ':sparkles: Ranked' }\nBPM: \`${body[j].bpm}\``,
							'image': {
								'url': body[j].covers['cover@2x']
							},
							'author': {
								'name': `Mapped by ${body[j].creator}`,
								'url': `https://osu.ppy.sh/u/${body[j].user_id}`,
								'icon_url': `https://a.ppy.sh/${body[j].user_id}?${Date.now().toString()}.png`
							}
						};
						embed.description += ' | Length: `' + (Math.floor(body[j].beatmaps[0].total_length / 60) + ':' + (body[j].beatmaps[0].total_length % 60 < 10 ? '0' + (body[j].beatmaps[0].total_length % 60) : body[j].beatmaps[0].total_length % 60)) + '`\n';
						body[j].beatmaps.sort((a : any, b : any) => a.difficulty_rating - b.difficulty_rating);
						embed.description += `[${body[j].beatmaps[body[j].beatmaps.length - 1].version}] ★: \`${body[j].beatmaps[body[j].beatmaps.length - 1].difficulty_rating}\`${body[j].beatmaps[body[j].beatmaps.length - 1].max_combo ? ' | combo: `' + body[j].beatmaps[body[j].beatmaps.length - 1].max_combo + 'x`' : ''}\n`;
						for (var k = 0 ; k < body[j].beatmaps.length; k++) {
							const diffIcon = client.emojis.find((emoji : any) => emoji.name === score.getDifficultyName(0, body[j].beatmaps[k].difficulty_rating) + '_' + body[j].beatmaps[k].mode);
							embed.description += diffIcon + ' ';
						}
						client.channels.get(docs[i].mapFeedChannelID).send({embed});
					}
				}

				database.update('utility', {lastChecked: lastChecked}, {
					lastChecked: new Date(Date.now()).getTime()
				}, {useCache: false, noLogs: true},(docs, err) => {if (err) throw err;});
			});
		});
	});
	// request(`https://osu.ppy.sh/beatmapsets/search`)
}

module.exports = {
	execute: execute
};