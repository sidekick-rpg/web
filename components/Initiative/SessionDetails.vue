<template>
	<div class="h-100">
		<v-toolbar title="Session">
			<v-btn v-if="editable" prepend-icon="mdi-refresh" size="large" @click="$emit('refresh')">Refresh</v-btn>
		</v-toolbar>

		<div class="h-100 fill-scroll with-toolbar">
			<v-list-item v-for="(player, index) in players" :key="index">
				<template v-slot:prepend>
					<v-icon :icon="player.host ? 'mdi-police-badge-outline' : 'mdi-account'"></v-icon>
				</template>
				{{ player.name }}
			</v-list-item>
		</div>
	</div>
</template>

<script lang="ts">
export default {
	name: 'SessionDetails',
	props: {
		editable: {
			type: Boolean,
			required: false,
			default() {
				return false
			},
		},
		players: {
			type: Array,
			required: true,
			default() {
				return []
			},
		},
	},
}
</script>
