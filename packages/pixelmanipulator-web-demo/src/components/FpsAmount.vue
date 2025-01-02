<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
const emit = defineEmits<{
	(e: 'change', amount: string): void
}>()
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
			aria-labelledby="fpsAmountLabel"
			@change="emit('change',fpsAmount)">
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
