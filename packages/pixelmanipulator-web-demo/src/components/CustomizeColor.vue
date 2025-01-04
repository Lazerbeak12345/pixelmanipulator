<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	'useCustomizeStore',
	// TODO: convert to emit
	'change',
])
const customizeStore = props.useCustomizeStore()
const { color } = storeToRefs(customizeStore)
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
