<script setup>
import { ref } from "vue";
import nuxtStorage from "nuxt-storage";
const loginName = ref("");
const loginPassword = ref("");
const router = useRouter();
const test = () => {
	// e.preventdefault();
	console.log("test", loginName.value);
};
const login = async () => {
	console.log("login");
	let body = { username: loginName.value, password: loginPassword.value };
	let response = await fetch("http://localhost:3001/auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	});

	if (response.ok) {
		let data = await response.json();
		console.log("data", data);
		nuxtStorage.localStorage.setData("token", data.token);
		nuxtStorage.localStorage.setData("user", loginName.value);
		// localStorage.setItem("token", data.token);
		// localStorage.setItem("user", loginName.value);
		router.push("/");
		console.log("okens", nuxtStorage.localStorage.getData("token"));
		console.log("user", nuxtStorage.localStorage.getData("user"));
	} else {
		console.log("ve och fasa");
	}
};
</script>
<template>
	<div class="loginContainer">
		<h1>Login</h1>
		<form class="formen" @submit.prevent="login">
			<label>Användarnamn:</label>
			<input type="text" v-model="loginName" />

			<label>Lösenord:</label>
			<input type="password" v-model="loginPassword" />

			<button>Logga in</button>
		</form>
	</div>
</template>

<style scoped>
.formen {
	display: flex;
	flex-direction: column;
}
.loginContainer {
	padding: 20px;
	border-radius: 20px;
	box-shadow: 2px 2px 2px black, -2px -2px 2px white;
	margin: 10px;
}
input {
	margin: 10px;
	border: none;
	border-radius: 10px;
	box-shadow: inset 1px 1px 1px white, inset 2px 2px 2px black;
	padding: 5px;
}
button {
	border: none;
	border-radius: 20px;
	box-shadow: 2px 2px 2px black, -2px -2px 2px white;
	max-width: 100px;
	height: 30px;
	cursor: pointer;
}
</style>
