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

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Now playing
const nowPlayingImage = document.getElementById("nowPlayingImage")
const nowPlayingSongName = document.getElementById("nowPlayingSongName")
const nowPlayingArtistName = document.getElementById("nowPlayingArtistName")
let currentNowPlayingMd5
let currentNowPlayingSongName

function addRemoveTextSlide(element) {
    if (element.getBoundingClientRect().width > 600) {
        element.classList.add("textSlide")
        return
    }
    element.classList.remove("textSlide")
}

socket.onmessage = event => {
    const data = JSON.parse(event.data)
    
    if (currentNowPlayingSongName !== data.menu.bm.metadata.title || currentNowPlayingMd5 !== data.menu.bm.md5) {
        currentNowPlayingSongName = data.menu.bm.metadata.title
        currentNowPlayingMd5 = data.menu.bm.md5

        // set now playing image
        nowPlayingImage.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${data.menu.bm.set}/covers/cover.jpg")`

        // Set song and artist name
        nowPlayingSongName.innerText = currentNowPlayingSongName
        nowPlayingArtistName.innerText = data.menu.bm.metadata.artist

        addRemoveTextSlide(nowPlayingSongName)
        addRemoveTextSlide(nowPlayingArtistName)
    }
}

ComfyJS.Init( "stagetournaments", null , ["stagetournaments", "stagetournaments2"] )
