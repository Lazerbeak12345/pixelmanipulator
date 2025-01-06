<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import FillGroup from './fillgroup/FillGroup.vue'

const props = defineProps([
	// TODO: move state into better place
	'useElementsStore',
	// TODO: move state into better place
	'useSideAccordionStore',
	// TODO: convert to emit
	'click',
])
const elementsStore = props.useElementsStore()
const sideAccordionStore = props.useSideAccordionStore()

const { elements } = storeToRefs(elementsStore)
const { fills } = storeToRefs(sideAccordionStore)
// v-model doesn't like deep refs. This effectively flattens a deep ref.
function flattenDeep<A>(name: string): ReturnType<typeof computed<A>> {
	return computed({
		get() { return fills.value[name] },
		set(v) { fills.value[name] = v }
	})
}
const normalFill = flattenDeep("normalFill")
const ctrlFill = flattenDeep("ctrlFill")
const altFill = flattenDeep("altFill")
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
