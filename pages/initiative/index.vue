<template>
	<v-container>
		<h1>Initiative Tracker</h1>

		<v-row>
			<v-col>
				<v-card title="Host Session" subtitle="Manage the Initiative Session as the DM/GM">
					<v-card-actions>
						<v-btn @click="host">Host</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
			<v-col>
				<v-card title="Join Session" subtitle="Join an Initiative Session as a Player">
					<v-card-actions>
						<v-btn @click="join">Join</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>

		<player-info v-model="dialog.info" @save="saveInfo" cancel @cancel="cancelInfo" />

		<v-dialog v-model="dialog.host" persistent :close-on-back="false" max-height="80%" max-width="80%" width="200px">
			<v-card>
				<v-card-text class="text-center">
					<v-progress-circular indeterminate class="mb-4" />
					<p>Creating session.</p>
					<p>Please wait.</p>
				</v-card-text>
				<v-card-actions>
					<v-btn color="red" block @click="dialog.host = false">Cancel</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="dialog.sessionCode" persistent :close-on-back="false" max-height="80%" max-width="80%" width="300px">
			<v-card>
				<v-card-text class="text-center">
					<v-card-title>Session code</v-card-title>
					<v-card-text class="text-center">
						<v-text-field v-model="sessionCode.code" label="Code*" autofocus required @keyup.enter="join" />
					</v-card-text>
				</v-card-text>
				<v-card-actions>
					<v-btn color="red" @click="dialog.sessionCode = false">Cancel</v-btn>
					<v-spacer />
					<v-btn color="primary" @click="join">Join</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
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
import PlayerInfo from '~/components/Initiative/PlayerInfo'
import randomatic from 'randomatic'
import { Initiative } from '~/store/Initiative'
import { Session } from '~/services/Session'

export default {
	components: {
		PlayerInfo,
	},
	data() {
		return {
			dialog: {
				info: false,
				host: false,
				sessionCode: false,
			},
			sessionCode: {
				code: '',
			},
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
		info: {
			get() {
				return Initiative.info
			},
			set(info) {
				Initiative.info = info
			},
		},
	},
	methods: {
		async host() {
			if (this.info.name === null || this.info.name === '') {
				this.dialog.info = true
				this.info.host = true
			} else {
				this.dialog.info = false
				this.dialog.host = true
				const id = this.generateSessionId()
				this.session = new Session(id)
				await this.session.host()
				this.$router.push({ name: 'initiative-session-id', params: { id: id } })
				this.dialog.host = false
			}
		},
		async join() {
			if (this.sessionCode.code === null || this.sessionCode.code === '') {
				this.dialog.sessionCode = true
			} else {
				this.dialog.sessionCode = false
				this.$router.push({ name: 'initiative-session-id', params: { id: this.sessionCode.code } })
			}
		},
		saveInfo(info) {
			this.dialog.info = false
			this.info = info
			this.host()
		},
		cancelInfo() {
			this.dialog.info = false
		},
		generateSessionId() {
			return randomatic('A', 6, { exclude: 'ILOVW' })
		},
	},
}
</script>
