<script setup lang="ts">
const fpsAmount = defineModel()
</script>
<template>
	<div class="input-group">
		<input
			type="number"
			min="1"
			class="form-control"
			id="fpsAmount"
			list="fpsAmountSuggestions"
			v-model="fpsAmount"
			pattern="\d*"
			placeholder="60"
			aria-labelledby="fpsAmountLabel">
		<datalist id="fpsAmountSuggestions">
			<option value="30"></option>
			<option value="60"></option>
			<option value="80"></option>
			<option value="120"></option>
		</datalist>
		<span
			class="input-group-text"
			id="fpsAmountLabel">
			fps
		</span>
	</div>
</template>
