<template>
	<div class="h-100">
		<player-info v-model="dialog.info" @save="saveInfo" />

		<v-dialog v-model="showConnectingDialog" persistent :close-on-back="false" max-height="80%" max-width="80%" width="200px">
			<v-card>
				<v-card-text v-if="connectionError === null" class="text-center">
					<v-progress-circular indeterminate class="mb-4" />
					<p class="pa-4">Connecting to session...</p>
				</v-card-text>
				<v-card-text v-else class="text-center">
					<p class="pa-4">Couldn't connect to "{{ this.$route.params.id }}".</p>
				</v-card-text>
			</v-card>
		</v-dialog>

		<v-row v-if="connectedToSession" no-gutters class="h-100">
			<v-col cols="3" class="fill-height">
				<characters :editable="session.isHost" :characters="characters" @edit="updateCharacter" @cancel="updateCharacter" @save="updateCharacter" @add="addCharacter" @delete="deleteCharacter" />
			</v-col>
			<v-col cols="3" class="fill-height">
				<tracker ref="tracker" :editable="session.isHost" :characters="characters" :status="status" @update="updateStatus" />
			</v-col>
			<v-col cols="3" class="fill-height">
				<p>TBD</p>
			</v-col>
			<v-col cols="3" class="fill-height">
				<session-details :editable="session.isHost" :players="players" @refresh="refreshOthers" />
			</v-col>
		</v-row>
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	layout: 'app',
})

useHead({
	title: 'Initiative Tracker',
})
</script>

<script lang="ts">
import * as uuid from 'uuid'
import Characters from '~/components/Initiative/Characters'
import lodash from 'lodash'
import PlayerInfo from '~/components/Initiative/PlayerInfo'
import SessionDetails from '~/components/Initiative/SessionDetails'
import Tracker from '~/components/Initiative/Tracker'
import { Initiative } from '~/store/Initiative'
import { Session } from '~/services/Session'

export default {
	components: {
		Characters,
		SessionDetails,
		Tracker,
	},
	data() {
		return {
			connectionError: null,
			dialog: {
				info: false,
			},
		}
	},
	mounted() {
		if (this.session && this.session.isHost === true) {
			this.session.on('data', this.handleSessionUpdate)
			this.session.on('disconnection', this.handleDisconnection)
			this.$refs.tracker.restart()
			this.info.id = this.session.peerId()
			this.players.push({
				...this.info,
				host: true,
			})
		} else {
			this.dialog.info = true
		}
	},
	computed: {
		session: {
			get() {
				return Initiative.session
			},
			set(session) {
				Initiative.session = session
			},
		},
		status: {
			get() {
				return Initiative.status
			},
			set(status) {
				Initiative.status = status
			},
		},
		characters: {
			get() {
				return Initiative.characters
			},
			set(characters) {
				Initiative.characters = characters
			},
		},
		players: {
			get() {
				return Initiative.players
			},
			set(players) {
				Initiative.players = players
			},
		},
		info: {
			get() {
				return Initiative.info
			},
			set(info) {
				Initiative.info = info
			},
		},
		connectedToSession() {
			return this.session && this.session.isConnected() === true
		},
		showConnectingDialog() {
			return this.dialog.info === false && !this.connectedToSession
		},
	},
	methods: {
		saveInfo(info) {
			this.dialog.info = false
			this.info = info
			this.startSession()
		},
		startSession() {
			this.session = new Session(this.$route.params.id)
			this.session.join()
				.then(() => {
					this.session.on('data', this.handleSessionUpdate)
					this.info.id = this.session.peerId()
					const player = {
						...this.info,
					}
					this.session.broadcast('player-joined', player)
				})
				.catch((err) => {
					this.connectionError = err
				})
		},
		updateStatus(status) {
			this.status.segment = status.segment
			this.status.dex = status.dex

			if (this.session.isHost === true) {
				this.session.broadcast('status-update', this.status)
			}
		},
		updateCharacter(guid, update) {
			let character = this.characters.find(c => c.guid === guid)

			if (character) {
				update.initiatives && update.initiatives.forEach(init => {
					init.spd = Number(init.spd)
					init.dex = Number(init.dex)
				})

				character = Object.assign(character, update)
			}

			if (this.session.isHost === true) {
				const updatedCharacter = lodash.cloneDeep(character)
				updatedCharacter.editing = false
				this.session.broadcast('character-update', updatedCharacter)
				this.$refs.tracker.restart()
			}
		},
		addCharacter(character) {
			this.characters.push(character)

			if (this.session.isHost === true) {
				this.$refs.tracker.restart()
				this.session.broadcast('character-add', character)
			}
		},
		deleteCharacter(guid) {
			const index = this.characters.findIndex(c => c.guid === guid)
			if (index !== -1) {
				this.characters.splice(index, 1)
			}

			if (this.session.isHost === true) {
				this.$refs.tracker.restart()
				this.session.broadcast('character-delete', guid)
			}
		},
		handleSessionUpdate(data) {
			console.log('handleSessionUpdate', data)
			switch (data.type) {
				case 'player-joined':
					this.players.push(data.data)
					this.refreshOthers()
					break
				case 'player-left':
					const index = this.players.findIndex(player => player.id === data.data.id)
					if (index > -1) {
						this.players.splice(index, 1)
					}
					break
				case 'status':
				case 'status-update':
					this.status = data.data
					break
				case 'characters':
					this.characters = data.data
					break
				case 'character-add':
					this.addCharacter(data.data)
					break
				case 'character-update':
					this.updateCharacter(data.data.guid, data.data)
					break
				case 'character-delete':
					this.deleteCharacter(data.data)
					break
				case 'players':
					this.players = data.data
				default:
					break
			}
		},
		handleDisconnection(peerId) {
			const index = this.players.findIndex(player => player.id === peerId)

			if (index > -1) {
				this.players.splice(index, 1)
				this.session.broadcast('player-left', { id: peerId })
			}
		},
		refreshOthers() {
			this.session.broadcast('players', this.players)
			this.session.broadcast('characters', this.characters)
			this.session.broadcast('status', this.status)
		},
	},
}
</script>
