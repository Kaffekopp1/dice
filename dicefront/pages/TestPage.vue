<script setup>
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
	auth: {
		token:
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjQyMzRiNmFiMTM1NTNmZjRkMTBiZTEiLCJpYXQiOjE3MTU2MzM5MDUsImV4cCI6MTcxNTYzNzUwNX0.g_BHQmxHsCEu_a9kPCb4P6-9ptwhH_3Qs2XipiO1_dk"
	}
}); // Assuming your Socket.IO server is running locally on port 3001

socket.on("connect", () => {
	console.log("Connected to Socket.IO server");
});
function test() {
	console.log("test");
	socket.emit("test", {
		test: "this is a test"
	});
}

// Disconnect socket when component is unmounted
onBeforeUnmount(() => {
	socket.disconnect();
});
</script>
<template>
	<div>TESTPAGE</div>
	<button @click="test()">click me</button>
</template>
