<script setup lang="ts">
const color = defineModel<string>()
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
