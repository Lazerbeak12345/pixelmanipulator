<script setup lang="ts">
import { watch, ref } from 'vue'
import { storeToRefs } from 'pinia'

import ElmSelect from './ElmSelect.vue'
import FillButton from './FillButton.vue'
import FillP from './FillP.vue'

const props = defineProps([
	// TODO: move state into better place
	'useStore',
	// TODO: move state into better place
	'useElementsStore',
	// TODO: convert to emit
	'click',
])
const store = props.useStore()
const elementsStore = props.useElementsStore()
const { percent, selected } = storeToRefs(store)
const { elements } = storeToRefs(elementsStore)
</script>
<template>
	<div class="click-type-random input-group">
		<ElmSelect v-model="selected" :elements />
		<FillButton @click="props.click(selected, percent)" />
		<FillP v-model="percent" />
		<span class="input-group-text">%</span>
	</div>
</template>
