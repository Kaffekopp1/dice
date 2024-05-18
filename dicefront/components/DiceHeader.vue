<script setup></script>
<template>
	<div>
		<menu class="linkMeny">
			<NuxtLink class="links" to="/">Hem</NuxtLink>
			<NuxtLink class="links" to="/login">login</NuxtLink>
			<!-- <NuxtLink class="links" to="/TestPAge">testpage</NuxtLink> -->
			<NuxtLink class="links" to="/Dicer">Dice</NuxtLink>
		</menu>
	</div>
</template>
<style scoped>
.linkMeny {
	display: flex;
	gap: 20px;
}
.links {
	list-style: none;
	text-decoration: none;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #000;
	border: none;
	padding: 10px;
	border-radius: 20px;
	box-shadow: 2px 2px 2px black, -2px -2px 2px white;
	max-width: 100px;
	height: 30px;
	cursor: pointer;
}
</style>
