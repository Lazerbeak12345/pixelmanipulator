<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	// TODO: move state into better place
	'useSettingsStore',
])
const settingsStore = props.useSettingsStore()
const { zoomSize } = storeToRefs(settingsStore)
</script>
<template>
	<div>
		<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
		Zoom Size:
		<div class="input-group">
			<input
				class="form-control"
				id="zoomWidthElm"
				type="number"
				v-model="zoomSize.w"
				placeholder="70"
				title="Default:20" />
			<span class="input-group-text">by</span>
			<input
				class="form-control"
				id="zoomHeightElm"
				type="number"
				v-model="zoomSize.h"
				placeholder="70"
				title="Default:20" />
			<span class="input-group-text">px</span>
		</div>
	</div>
</template>
