<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	'useCustomizeNameStore',
	// TODO: convert to emit
	'change',
])
const customizeNameStore = props.useCustomizeNameStore()
const { name } = storeToRefs(customizeNameStore)
watch(name, name=>props.change(name))
</script>
<template>
	<label>
		<i class="fa-solid fa-tag" aria-hidden="true"></i>
		Change Name:
		<input type="text" class="form-control" v-model="name">
	</label>
</template>
