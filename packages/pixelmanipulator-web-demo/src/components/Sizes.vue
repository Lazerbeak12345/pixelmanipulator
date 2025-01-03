<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	'useSettingsStore',
])
const sizesStore = props.useSettingsStore()
const { size } = storeToRefs(sizesStore)
</script>
<template>
	<div>
		<i class="fa-solid fa-arrows" aria-hidden="true"></i>
		Size:
		<div class="input-group">
			<input
				class="form-control"
				id="width"
				type="number"
				v-model="size.w"
				placeholder="150"
				title="Default:150"/>
			<span class="input-group-text">by</span>
			<input
				class="form-control"
				id="height"
				type="number"
				v-model="size.h"
				placeholder="150"
				title="Default:150"/>
			<span class="input-group-text">px</span>
		</div>
	</div>
</template>
