<script setup lang="ts">
const alpha = defineModel<string>()
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
