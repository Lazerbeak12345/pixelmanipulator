<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import FillGroup from './fillgroup/FillGroup.vue'

const props = defineProps([
	// TODO: move state into better place
	'useElementsStore',
	// TODO: move state into better place
	'useAppElementsStore',
	// TODO: convert to emit
	'click',
])
const elementsStore = props.useElementsStore()
const appElementsStore = props.useAppElementsStore()

const { elements } = storeToRefs(elementsStore)
const { normalFill, ctrlFill, altFill } = storeToRefs(appElementsStore)
</script>
<template>
	<div>
		Click:
		<FillGroup
			@click="props.click"
			:elements
			v-model:selected="normalFill.selected"
			v-model:percent="normalFill.percent"
		/>
	</div>
	<div>
		<kbd>Ctrl</kbd> + click:
		<FillGroup
			@click="props.click"
			:elements
			v-model:selected="ctrlFill.selected"
			v-model:percent="ctrlFill.percent"
		/>
	</div>
	<div>
		<kbd>Alt</kbd> + click:
		<FillGroup
			@click="props.click"
			:elements
			v-model:selected="altFill.selected"
			v-model:percent="altFill.percent"
		/>
	</div>
</template>
