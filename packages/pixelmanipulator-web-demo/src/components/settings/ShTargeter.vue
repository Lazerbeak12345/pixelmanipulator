<script setup lang="ts">
const checked = defineModel<boolean>()
</script>
<template>
	<div class="form-check">
		<input
			class="form-check-input"
			id="shtargeter"
			v-model="checked"
			type="checkbox">
		<label
			class="form-check-label"
			for="shtargeter"
			title="Show targeter lines"
		>
			<i class="fa-solid fa-crosshairs" aria-hidden="true"></i>
			Targeter Lines
		</label>
	</div>
</template>
