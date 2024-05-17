<script setup>
definePageMeta({
  middleware: "auth",
});

import { onMounted, ref } from "vue";

import nuxtStorage from "nuxt-storage";

const kasten = ref([]);
const total = ref(0);
const diceThrows = ref(1);
const userMessage = ref(null);
const messages = ref([]);
const token = ref(nuxtStorage.localStorage.getData("token"));
const user = ref(nuxtStorage.localStorage.getData("user"));
const activePlayers = ref([]);
const ejAktiv = ref(false);
const wait = ref(false);
// console.log("okens", localStorage.getItem("token"));
// console.log("okens", localStorage.getItem("user"));

import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  auth: {
    token: token.value,
  },
});
function test() {
  console.log("token user", token.value, user.value);
}
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
});
//TODO glöm ej att ändra user till riktig user
const throwTheDice = () => {
  console.log("throw", activePlayers.value);
  let player = activePlayers.value.users.filter((pl) => pl == user.value);
  if (player.length < 1) {
    ejAktiv.value = true;
    return;
  }
  console.log(kasten.value[0]?.user, "at", user.value);
  if (kasten.value[0]?.user == user.value) {
    wait.value = true;
    return;
  }
  ejAktiv.value = false;
  let diceValue = Math.floor(Math.random() * 6 + 1);
  total.value = total.value + diceValue;
  socket.emit("dice", {
    diceValue: diceValue,
    diceThrows: diceThrows.value,
    total: total.value,
    user: user.value,
  });
  diceThrows.value++;
};
socket.on("newMessage", (message) => {
  console.log("message", message);
  messages.value.unshift(message);
});

socket.emit("game", { user: user.value });
socket.on("players", (pl) => {
  activePlayers.value = pl;
});
const sendMessage = () => {
  if (userMessage.value) {
    socket.emit("chatMessage", {
      user: user.value,
      message: userMessage.value,
    });
    userMessage.value = "";
  }
};

socket.on("newThrow", (diceThrow) => {
  console.log("dicethrow", diceThrow);
  kasten.value.unshift(diceThrow);
  wait.value = false;
});

onBeforeUnmount(() => {
  socket.disconnect();
});
</script>
<template>
  <div>
    <h2>Dicer</h2>
    <p>du är {{ user }}</p>
    <p v-for="(pl, index) in activePlayers.users">spelare:{{ pl }}</p>
    <div v-if="!wait">
      <button v-if="!ejAktiv" @click="throwTheDice">Throw the dice</button>
      <p v-else>Du är inte spelare, maxantal 2</p>
    </div>
    <div v-else>
      <p>vänta på din tur</p>
    </div>
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
