<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	'useCustomizeStore',
	// TODO: convert to emit
	'change'
])
const customizeStore = props.useCustomizeStore()
const { alpha } = storeToRefs(customizeStore )
watch(alpha, a=>props.change(a))
</script>
<template>
	<label>
		Alpha (Opacity) {{ alpha }}
		<input
			type="range"
			class="form-range"
			min="0"
			max="255"
			step="1"
			v-model="alpha" >
	</label>
</template>
