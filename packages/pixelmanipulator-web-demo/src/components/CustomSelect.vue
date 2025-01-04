<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	'useCustomSelectStore',
	// TODO: convert to emit
	'change',
])
const customSelectStore = props.useCustomSelectStore()
const { selected, elements } = storeToRefs(customSelectStore)
watch(selected, s=>props.change(s))
</script>
<template>
	<select class="form-select" v-model="selected">
		<option v-for="name in elements" :key="name">
			{{ name}}
		</option>
	</select>
</template>
