<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	'useSettingsStore',
	// TODO: convert to emit
	'change'
]);
const settingsStore = props.useSettingsStore()
const { shTargeter: checked } = storeToRefs(settingsStore)
</script>
<template>
	<div class="form-check">
		<input class="form-check-input" id="shtargeter" v-model="checked" type="checkbox" @change="props.change(checked)">
		<label class="form-check-label" for="shtargeter" title="Show targeter lines">
			<i class="fa-solid fa-crosshairs" aria-hidden="true"></i>
			Targeter Lines
		</label>
	</div>
</template>
