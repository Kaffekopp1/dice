import nuxtStorage from "nuxt-storage";

export default defineNuxtRouteMiddleware(async (context, to, from) => {
	const token = nuxtStorage.localStorage.getData("token");

	console.log("From auth middleware", token);
	console.log("to", to, from);
	const checkToken = await fetch("http://localhost:3001/auth/auth", {
		headers: {
			Authorization: `${token}`
		}
	});
	const response = await checkToken.json();
	console.log("response", response);

	if (response.message) {
		// User is authenticated, proceed to the route
	} else {
		// User is not authenticated, redirect to login
		return navigateTo("/login");
	}
});
