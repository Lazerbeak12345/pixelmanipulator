<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	"useFpsAmountStore",
	// TODO: convert to emit
	'change'
]);
const fpsAmountStore = props.useFpsAmountStore()
const { value } = storeToRefs(fpsAmountStore)
</script>
<template>
	<div class="input-group">
		<input
			type="number"
			min="1"
			class="form-control"
			id="fpsAmount"
			list="fpsAmountSuggestions"
			v-model="value"
			pattern="\d*"
			placeholder="60"
			aria-labelledby="fpsAmountLabel"
			@change="props.change(value)">
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
