<script setup lang="ts">
import FillGroup from './fillgroup/FillGroup.vue'

interface Fill {
	selected: string
	percent: number
}
const props = defineProps<{
	elements: string[]
	normalFill: Fill
	ctrlFill: Fill
	altFill: Fill
}>()
const emit = defineEmits<{
	(e: 'click', element: string, percent: number): void
}>()

function doClick(element: string, percent: number): void {
	emit('click', element, percent)
}
</script>
<template>
	<div>
		Click:
		<FillGroup
			@click="doClick"
			:elements
			v-model:selected="normalFill.selected"
			v-model:percent="normalFill.percent"
		/>
	</div>
	<div>
		<kbd>Ctrl</kbd> + click:
		<FillGroup
			@click="doClick"
			:elements
			v-model:selected="ctrlFill.selected"
			v-model:percent="ctrlFill.percent"
		/>
	</div>
	<div>
		<kbd>Alt</kbd> + click:
		<FillGroup
			@click="doClick"
			:elements
			v-model:selected="altFill.selected"
			v-model:percent="altFill.percent"
		/>
	</div>
</template>
