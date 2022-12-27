<template>
	<v-list class="pt-0 pb-0 h-100">
		<v-toolbar>
			<v-btn v-if="editable" :disabled="initiatives.length < 1" prepend-icon="mdi-menu-left" size="large">
				Prev
			</v-btn>

			<v-spacer/>

			<template v-if="initiatives.length > 0">
				<v-chip label size="small" variant="outlined" class="mr-1">
					<v-icon start icon="mdi-clock-fast"></v-icon>
					SEG: {{ status.segment }}
				</v-chip>
				<v-chip label size="small" variant="outlined">
					<v-icon start icon="mdi-karate"></v-icon>
					DEX: {{ status.dex }}
				</v-chip>
			</template>

			<v-spacer/>

			<v-btn v-if="editable" :disabled="initiatives.length < 1" append-icon="mdi-menu-right" size="large" @click="next">
				Next
			</v-btn>
		</v-toolbar>

		<div class="h-100 fill-scroll with-toolbar">
			<v-list-item
				v-for="(initiative, index) in initiatives"
				:key="index"
				:active="initiative.current || initiative.next"
				:active-color="initiative.current === true ? 'green' : 'blue'"
				:style="status.segment === initiative.segment ? 'opacity: 1' : 'opacity: 0.4'"
				:ref="initiative.current ? 'current' : `initiative-${initiative.character.guid}`"
			>
				<template v-slot:prepend>
					<v-icon :color="initiative.current ? 'green' : initiative.next ? 'blue-darken-4' : 'grey-darken-3'">mdi-arrow-right-bold</v-icon>
				</template>

				<v-list-item-title>
					<strong>{{ initiative.character.name }}</strong><span v-if="initiative.description" class="text-medium-emphasis"> ({{ initiative.description }})</span>
				</v-list-item-title>

				<v-list-item-subtitle>
					<v-chip label size="small" variant="outlined" class="mr-1">
						<v-icon start icon="mdi-clock-fast"></v-icon>
						SEG: {{ initiative.segment }}
					</v-chip>
					<v-chip label size="small" variant="outlined">
						<v-icon start icon="mdi-karate"></v-icon>
						DEX: {{ initiative.dex }}
					</v-chip>
				</v-list-item-subtitle>
			</v-list-item>
		</div>
	</v-list>
</template>

<script lang="ts">
import { Speed } from '~/data/hero6/Speed'

export default {
	name: 'Tracker',
	props: {
		editable: {
			type: Boolean,
			required: false,
			default() {
				return false
			},
		},
		characters: {
			type: Array,
			required: true,
			default() {
				return []
			},
		},
		status: {
			type: Object,
			required: true,
			default() {
				return {
					segment: null,
					dex: null,
				}
			},
		},
	},
	watch: {
		status: {
			handler() {
				this.scrollToCurrentInitiative()
			},
			deep: true,
		},
	},
	computed: {
		initiatives() {
			let inits = []
			let foundCurrent = false

			if (this.characters.length === 0 ||
				this.characters.filter(c => c.editing === true).length === this.characters.length
			) {
				return inits
			}

			this.characters.forEach(character => {
				character.initiatives.forEach(init => {
					const segments = Speed.Segments(init.spd)

					segments.forEach(segment => {
						const isCurrent = (segment === this.status.segment && init.dex === this.status.dex)

						if (isCurrent === true) {
							foundCurrent = true
						}

						inits.push({
							segment,
							...init,
							character,
							...{
								current: isCurrent,
								next: false,
							},
						})
					})
				})
			})

			inits.sort(Speed.SortInitiatives)

			const currentIndex = inits.findLastIndex(init => init.current === true)

			if (currentIndex > -1) {
				if (currentIndex < inits.length - 1) {
					inits[currentIndex + 1].next = true
				} else {
					inits[0].next = true
				}
			}

			if (foundCurrent === false) {
				this.$nextTick(() => {
					this.restart()
				})
			}

			return inits
		},
	},
	methods: {
		restart() {
			if (this.initiatives.length < 1) {
				return
			}

			const firstInitiative = this.initiatives[0]
			this.$emit('update', { segment: firstInitiative.segment, dex: firstInitiative.dex })
		},
		next() {
			const currentIndex = this.initiatives.findLastIndex(init => init.current === true)

			if (currentIndex > -1) {
				let nextInitiative = null

				if (currentIndex < this.initiatives.length - 1) {
					nextInitiative = this.initiatives[currentIndex + 1]
				} else {
					nextInitiative = this.initiatives[0]
				}

				if (nextInitiative !== null) {
					this.$emit('update', { segment: nextInitiative.segment, dex: nextInitiative.dex })
				}
			}
		},
		scrollToCurrentInitiative() {
			if (!this.$refs.current || this.$refs.current.length === 0) {
				return
			}

			this.$nextTick(() => {
				this.$refs.current[0].$el.scrollIntoView()
			})
		},
	},
}
</script>
