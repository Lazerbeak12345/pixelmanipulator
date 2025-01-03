<script setup lang="ts">
const checked = defineModel<number>()
</script>
<template>
	<div class="form-check">
		<input class="form-check-input" id="shfocusbox" v-model="checked" type="checkbox">
		<label class="form-check-label" for="shfocusbox" title="Show focus box">
			<i class="fa-solid fa-square" aria-hidden="true"></i>
			Focus Box
		</label>
	</div>
</template>
