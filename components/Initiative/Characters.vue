<template>
	<div class="h-100">
		<v-toolbar>
			<v-btn v-if="editable" prepend-icon="mdi-account-multiple-plus" size="large" @click="add">Add Character</v-btn>
		</v-toolbar>

		<div class="h-100 fill-scroll with-toolbar">
			<v-row :no-gutters="false" class="pa-4 pb-0" >
				<v-col v-if="characters.length > 0" v-for="(character, index) in characters" :key="index" :ref="`character-${character.guid}`" cols="12">
					<v-card :variant="character.editing ? 'tonal' : 'flat'">
						<v-card-title v-if="character.editing === false" class="text-center" :title="character.guid">{{ character.name }}</v-card-title>
						<v-text-field v-if="character.editing === true" v-model="character.draft.name" label="Character name" density="compact" single-line hide-details="auto" class="edit-character-name">
							<template v-slot:prepend-inner>
								<v-icon icon="mdi-pencil" size="small" />
							</template>
						</v-text-field>

						<v-table density="compact">
							<thead>
								<tr>
									<th class="text-right">Speed&nbsp;(SPD)</th>
									<th class="text-right">Dexterity&nbsp;(DEX)</th>
									<th class="text-left" width="100%">
										Description
									</th>
									<th>
										<v-btn v-if="character.editing === true" icon="mdi-plus" variant="text" size="x-small" @click="addInitiative(character)"></v-btn>
									</th>
								</tr>
							</thead>
							<tbody>
								<tr v-if="character.editing === false" v-for="(initiative, index) in character.initiatives" :key="index">
									<td class="text-right">
										<template v-if="character.editing === false">{{ initiative.spd }}</template>
									</td>
									<td class="text-right">
										<template v-if="character.editing === false">{{ initiative.dex }}</template>
									</td>
									<td>
										<template v-if="character.editing === false">{{ initiative.description }}</template>
									</td>
									<td></td>
								</tr>
								<tr v-if="character.editing === true" v-for="(initiative, index) in character.draft.initiatives" :key="index">
									<td class="text-right">
										<v-text-field v-if="character.editing === true" v-model="initiative.spd" density="compact" variant="solo" single-line hide-details="auto" class="edit-initiative" />
									</td>
									<td class="text-right">
										<v-text-field v-if="character.editing === true" v-model="initiative.dex" density="compact" variant="solo" single-line hide-details="auto" class="edit-initiative" />
									</td>
									<td>
										<v-text-field v-if="character.editing === true" v-model="initiative.description" density="compact" variant="solo" single-line hide-details="auto" class="edit-initiative description" />
									</td>
									<th>
										<v-btn icon="mdi-delete" variant="text" size="x-small" @click="deleteInitiative(character, index)"></v-btn>
									</th>
								</tr>
							</tbody>
						</v-table>

						<template v-if="editable">
							<v-card-actions v-if="character.editing === false">
								<v-btn @click="edit(character)">Edit</v-btn>
								<v-spacer />
								<v-btn @click="del(character)">Delete</v-btn>
							</v-card-actions>

							<v-card-actions v-else>
								<v-btn @click="cancelEdit(character)">Cancel</v-btn>
								<v-spacer />
								<v-btn @click="save(character)">Save</v-btn>
							</v-card-actions>
						</template>
					</v-card>
				</v-col>
				<v-col v-else>
					<v-card>
						<v-card-text class="text-center">
							<p v-if="editable" class="pa-4">Add a character to continue.</p>
							<p v-else class="pa-4">No characters.</p>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</div>
	</div>
</template>

<script lang="ts">
import * as uuid from 'uuid'
import lodash from 'lodash'

export default {
	name: 'Characters',
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
	},
	methods: {
		add() {
			const char = {
				guid: uuid.v4(),
				name: 'New Character',
				initiatives: [
					{
						spd: 2,
						dex: 10,
						description: '',
					},
				],
				editing: false,
			}

			this.$emit('add', char)
			this.scrollTo(char)
			this.edit(char)
		},
		edit(character) {
			const updated = {
				draft: {
					name: character.name,
					initiatives: lodash.cloneDeep(character.initiatives),
				},
				editing: true,
			}

			this.$emit('edit', character.guid, updated)
		},
		cancelEdit(character) {
			const updated = {
				draft: null,
				editing: false,
			}

			this.$emit('cancel', character.guid, updated)
		},
		save(character) {
			const updated = {
				name: character.draft.name,
				initiatives: character.draft.initiatives,
				editing: false,
				draft: null,
			}

			updated.initiatives.forEach(init => {
				init.spd = Number(init.spd)
				init.dex = Number(init.dex)
			})

			this.$emit('save', character.guid, updated)
		},
		del(character) {
			this.$emit('delete', character.guid)
		},
		addInitiative(character) {
			character.draft.initiatives.push({
				spd: 12,
				dex: 10,
				description: '',
			})
		},
		deleteInitiative(character, index) {
			character.draft.initiatives.splice(index, 1)
		},
		scrollTo(character) {
			this.$nextTick(() => {
				this.$refs[`character-${character.guid}`][0].$el.scrollIntoView()
				//this.scrollToCurrentInitiative()
			})
		},
	},
}
</script>
