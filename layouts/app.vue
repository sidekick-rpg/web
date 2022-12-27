<template>
	<v-app style="max-height: 100vh">
		<v-app-bar density="compact">
			<v-app-bar-title>Sidekick</v-app-bar-title>
		</v-app-bar>

		<v-main style="max-height: 100%">
			<slot />
		</v-main>
	</v-app>
</template>

<script setup lang="ts">
useHead({
	titleTemplate: (title) => {
		return title ? `${title} - Sidekick` : 'Sidekick';
	}
})
</script>
