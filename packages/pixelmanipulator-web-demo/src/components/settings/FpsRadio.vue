<script setup lang="ts">
import FpsAmount from './FpsAmount.vue'
const fpsAmount = defineModel<number>("fpsAmount")
const unlimited = defineModel<boolean>("unlimited")
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
				<FpsAmount v-model="fpsAmount" />
			</label>
		</div>
	</div>
</template>
