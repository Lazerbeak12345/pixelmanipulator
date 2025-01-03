<script setup lang="ts">
const checked = defineModel<boolean>()
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
