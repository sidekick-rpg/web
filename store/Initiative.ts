import { reactive } from 'vue'

export const Initiative = reactive({
	session: null,
	status: {
		segment: null,
		dex: null,
	},
	characters: [],
	players: [],
	info: {
		name: null,
		id: null,
		host: false,
	},
})
