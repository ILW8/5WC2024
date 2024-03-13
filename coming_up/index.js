// Credit to shdewz for most of this: https://github.com/shdewz/3wc-stream-overlay

let comingup, teams, countries;
(async () => {
	$.ajaxSetup({ cache: false });
	comingup = await $.getJSON('../_data/coming_up.json');
	teams = await $.getJSON('../_data/players.json');
    countries = await $.getJSON('../_data/countries.json');

	let timer_end = comingup.time - 0 * 60 * 60 * 1000;
	if (timer_end > Date.now()) {
		let timer_int = setInterval(() => {
			if (timer_end < Date.now()) {
				clearInterval(timer_int);
				if (timer) timer.innerHTML = '00:00';
			}
			let remaining = Math.floor((timer_end - Date.now()) / 1000);
			let hours = Math.floor(remaining / 60 / 60);
			let date = new Date(null);
			date.setSeconds(remaining);
			let text = hours > 0 ? date.toISOString().slice(11, 19) : date.toISOString().slice(14, 19);
			if (timer && remaining > 0) timer.innerHTML = text;
		}, 1000);
	}

	let team_red = teams.find(t => t.team_name == comingup.red_team);
    console.log(teams.find(t => t.team_name == comingup.red_team))
	if (team_red) {
		document.getElementById('red-team').innerHTML = team_red.team_name;
		document.getElementById('red-flag').src = `https://osuflags.omkserver.nl/${team_red.osu_flag}-126.png`;
		for (let i = 0; i < 8; i++) {
			let player = team_red.players[i] || '';
			document.getElementById(`red-player-${i + 1}`).innerHTML = player;
		}
	}

	let team_blue = teams.find(t => t.team_name == comingup.blue_team);
	if (team_blue) {
		document.getElementById('blue-team').innerHTML = team_blue.team_name;
		document.getElementById('blue-flag').src = `https://osuflags.omkserver.nl/${team_blue.osu_flag}-126.png`;
		for (let i = 0; i < 8; i++) {
			let player = team_blue.players[i] || '';
			document.getElementById(`blue-player-${i + 1}`).innerHTML = player;
		}
	}
})();

let title = document.getElementById('title');
let time = document.getElementById('time');
let timer = document.getElementById('timer');