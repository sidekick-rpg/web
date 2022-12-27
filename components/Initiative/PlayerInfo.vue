<template>
	<v-dialog persistent :close-on-back="false" max-height="80%" max-width="80%" width="300px">
		<v-card>
			<v-card-title>Player details</v-card-title>
			<v-card-text class="text-center">
				<v-text-field v-model="info.name" label="Name*" autofocus required @keyup.enter="saveForm" />
			</v-card-text>
			<v-card-actions>
				<v-btn v-if="cancel" color="red" @click="cancelForm">Cancel</v-btn>
				<v-spacer />
				<v-btn color="primary" @click="saveForm">Save</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
export default {
	name: 'PlayerInfo',
	props: {
		cancel: {
			type: Boolean,
			default() {
				return false
			},
		},
	},
	data() {
		return {
			info: {
				name: '',
			},
		}
	},
	methods: {
		cancelForm() {
			this.$emit('cancel')
		},
		saveForm() {
			this.$emit('save', this.info)
		},
	},
}
</script>
