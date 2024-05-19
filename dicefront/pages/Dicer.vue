<script setup>
definePageMeta({
	middleware: "auth"
});

import { onMounted, ref } from "vue";

import nuxtStorage from "nuxt-storage";

const kasten = ref([]);
const activePlayers = ref([]);
const notPlayer = ref(false);
const latestPlayer = ref("");
const total = ref(0);
const winner = ref(null);
const diceThrows = ref(0);
const wTotal = ref(0);
const userMessage = ref(null);
const messages = ref([]);
const token = ref(nuxtStorage.localStorage.getData("token"));
const user = ref(nuxtStorage.localStorage.getData("user"));

// console.log("okens", localStorage.getItem("token"));
// console.log("okens", localStorage.getItem("user"));

import io from "socket.io-client";

// variabler för att hålla koll på vilka som spelar endast två
let users = [];

const socket = io("http://localhost:3001", {
	auth: {
		token: token.value
	}
});
function test() {
	console.log("token user", token.value, user.value);
}
socket.on("connect", () => {
	console.log("Connected to Socket.IO server");
});
// när spelare har loggat in hämta andra spelare:
socket.emit("game", { user: user.value });
// hämta alla spelare kolla ifall aktuell spelare är aktiv om inte
// hindra denne från att kunna trycka på knappen.
socket.on("players", (pl) => {
	activePlayers.value = pl;
	console.log(pl.users, "users");
	user.value == pl.users.filter((player) => player == user.value)[0]
		? (notPlayer.value = false)
		: (notPlayer.value = true);
});
//TODO gör spelet i backend efter inlämning
const throwTheDice = () => {
	let diceValue = Math.floor(Math.random() * 6 + 1);
	total = total.value + diceValue;
	socket.emit("thrower", {
		value: diceValue,
		total: total.value,
		diceThrows: diceThrows.value,
		user: user.value
	});
};
socket.on("newMessage", (message) => {
	console.log("message", message);
	messages.value.unshift(message);
});

const sendMessage = () => {
	if (userMessage.value) {
		socket.emit("chatMessage", {
			user: user.value,
			message: userMessage.value
		});
		userMessage.value = "";
	}
};

socket.on("newThrow", (diceThrow) => {
	kasten.value.unshift(diceThrow);
	latestPlayer.value = diceThrow.latestPlayer;
	if (diceThrow.user == user.value) {
		total.value = diceThrow.total;
		diceThrows.value = diceThrow.diceThrows;
	}
});
// if not a player
socket.on("notaplayer", (p) => {
	console.log(
		"user",
		p,
		user.value,
		p.users.filter((pl) => pl == user.value)
	);
	user.value != p.users.filter((pl) => pl == user.value)[0]
		? (notPlayer.value = true)
		: (notPlayer.value = false);
});
// if latest player
socket.on("latestPlayer", (lp) => {
	latestPlayer.value = lp.latestPlayer;
});
// if winner

socket.on("winner", (w) => {
	winner.value = w.winner;
	wTotal.value = w.total;
	diceThrows.value = 0;
});
onBeforeUnmount(() => {
	socket.disconnect();
});
const newgame = () => {
	winner.value = null;
	total.value = 0;
	diceThrows.value = 0;
	socket.emit("game", { user: user.value });
};
</script>
<template>
	<h1>{{ user }}</h1>
	Vinnare: {{ winner }} Totalt: {{ wTotal }}
	<div v-if="!winner">
		<p>Antal spelare:{{ activePlayers?.users?.length }}</p>
		<p>
			Senaste spelaren:
			{{ latestPlayer }}
		</p>
		<div v-if="!notPlayer">
			<h2>Dicer</h2>
			<div v-if="activePlayers?.users?.length < 2">Vänta på spelare</div>
			<div v-else>
				<div>
					<h3>Spelare:</h3>
					<p v-for="player in activePlayers.users">{{ player }}</p>
				</div>
				<div>
					<p v-if="latestPlayer == user">Wait for your turn</p>
					<button v-else @click="throwTheDice">Throw the dice</button>
				</div>
			</div>
		</div>
		<div v-else>
			<p>Tyvärr är det fullt just nu, kom gärna senare {{ user }}</p>
		</div>
		<div>
			<div class="kastInformation">
				<ul>
					<li v-for="kast in kasten">
						<p>Värde:{{ kast.diceValue }}</p>
						<p>antalkast: {{ kast.diceThrows }}</p>
						<p>totalavärdet: {{ kast.total }}</p>
						<p>användare: {{ kast.user }}</p>
					</li>
				</ul>
			</div>
			<div class="messages">
				<form @submit.prevent="sendMessage">
					<label>Meddelande:</label>
					<input type="text" v-model="userMessage" />
					<button>Skicka Meddelande</button>
				</form>
				<div>
					<ul>
						<li v-for="message in messages">
							<p>
								Användare:
								{{ message.user }}
							</p>
							<p>Meddelande:</p>
							<p>
								{{ message.message }}
							</p>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<div v-else>
		<button @click="newgame">spela!</button>
	</div>
</template>
<style scoped>
.messages {
	display: flex;
	flex-direction: column;
	top: 100px;
	border-radius: 20px;
	margin: 20px;
	right: 5px;
	padding: 20px;
	background-color: aliceblue;
	max-height: 200px;
	overflow: scroll;
	box-shadow: 5px 5px 10px black;
}
.messages li {
	display: flex;
	gap: 20px;
	border: dotted;
	margin: 10px;
	padding: 10px;
}
.kastInformation {
	flex-direction: column;
	top: 400px;
	bottom: 10px;
	border-radius: 20px;

	right: 5px;
	padding: 20px;
	background-color: aliceblue;
	max-height: 200px;
	overflow: scroll;
	box-shadow: 5px 5px 10px black;
}
li {
	list-style: none;
	display: flex;
	gap: 20px;
	border: dotted;
	margin: 10px;
	padding: 10px;
}
input {
	margin: 10px;
	border: none;
	border-radius: 10px;
	box-shadow: inset 1px 1px 1px white, inset 2px 2px 2px black;
	padding: 5px;
}
button {
	margin: 10px;
	border: none;
	padding: 10px;
	border-radius: 20px;
	box-shadow: 2px 2px 2px black, -2px -2px 2px white;
	max-width: 100px;
	min-height: 30px;
	cursor: pointer;
}
</style>
