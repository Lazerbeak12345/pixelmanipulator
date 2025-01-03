<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	'useSettingsStore',
	// TODO: convert to emit
	'change'
]);
const settingsStore = props.useSettingsStore()
const { pixelCounterT : checked } = storeToRefs(settingsStore)
watch(checked, checked => props.change(checked))
</script>
<template>
	<div class="form-check">
		<input class="form-check-input" id="pixelCounterT" v-model="checked" type="checkbox">
		<label class="form-check-label" for="pixelCounterT" title="Show PixelCounter">
			<i class="fa-solid fa-list-ol" aria-hidden="true"></i>
			PixelCounter
		</label>
	</div>
</template>
