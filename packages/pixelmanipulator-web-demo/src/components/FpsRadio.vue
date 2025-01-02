<script setup lang="ts">
import FpsAmount from './FpsAmount.vue'

import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	"useFpsRadioStore",
	// TODO: convert to emit
	'changeFps',
	// TODO: convert to emit
	'changeUnlimited',
]);
const fpsRadioStore = props.useFpsRadioStore()
const { unlimited, fpsAmount } = storeToRefs(fpsRadioStore)
watch(unlimited, unlimited=> props.changeUnlimited(unlimited))
</script>
<template>
	<div>
		<i class="fa-solid fa-hourglass" aria-hidden="true"></i>
		FPS:
		<div class="form-check">
			<input
				type="radio"
				class="form-check-input"
				name="fpsRadio"
				id="fpsUnlimited"
				:checked="unlimited"
				@click="unlimited = true">
			<label for="fpsUnlimited" class="form-check-label">
				<i
					class="fa-solid fa-truck-fast"
					aria-hidden="true">
				</i>
				Unlimited
			</label>
		</div>
		<div class="form-check">
			<input
				type="radio"
				class="form-check-input"
				name="fpsRadio"
				id="fpsLimited"
				:checked="!unlimited"
				@click="unlimited = false">
			<label for="fpsLimited" class="form-check-label">
				<i class="fa-solid fa-truck" aria-hidden="true"></i>
				Value:
				<FpsAmount
					v-model="fpsAmount"
					@change="props.changeFps" />
			</label>
		</div>
	</div>
</template>
