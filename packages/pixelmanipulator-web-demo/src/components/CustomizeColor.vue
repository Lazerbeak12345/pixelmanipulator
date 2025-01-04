<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	'useCustomizeColorStore',
	// TODO: convert to emit
	'change',
])
const customizeColorStore = props.useCustomizeColorStore()
const { color } = storeToRefs(customizeColorStore)
watch(color, c=>props.change(c))
</script>
<template>
	<label>
		<i class="fa-solid fa-eyedropper" aria-hidden="true"></i>
		Element Color
		<input
			type="color"
			class="form-control form-control-color"
			v-model="color" >
	</label>
</template>
