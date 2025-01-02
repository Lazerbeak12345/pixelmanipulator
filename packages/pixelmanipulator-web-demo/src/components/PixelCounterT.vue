<script setup lang="ts">
import {computed, ref} from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	'usePixelCounterTStore',
	// TODO: convert to emit
	'change'
]);
const pixelCounterTStore = props.usePixelCounterTStore()
const { checked } = storeToRefs(pixelCounterTStore)
const pixelCounterT = ref()
</script>
<template>
	<div class="form-check">
		<input class="form-check-input" value="" ref="pixelCounterT" id="pixelCounterT" v-model="checked" type="checkbox" @change="props.change(checked)">
		<label class="form-check-label" for="pixelCounterT" title="Show PixelCounter">
			<i class="fa-solid fa-list-ol" aria-hidden="true"></i>
			PixelCounter
		</label>
	</div>
</template>
