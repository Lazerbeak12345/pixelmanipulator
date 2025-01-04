<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'

import ElmSelect from '../ElmSelect.vue'
import CustomizeColor from './CustomizeColor.vue'
import CustomColorAlpha from './CustomColorAlpha.vue'
import CustomizeName from './CustomizeName.vue'

const props = defineProps([
	// TODO: move state into better place
	'useCustomizeStore',
	// TODO: move state into better place
	'useElementsStore',
	// TODO: convert to emit
	'changeSelected',
	// TODO: convert to emit
	'changeColor',
	// TODO: convert to emit
	'changeName'
])
const customizeStore = props.useCustomizeStore()
const elementsStore = props.useElementsStore()
const { selected, color, alpha, name } = storeToRefs(customizeStore)
const { elements } = storeToRefs(elementsStore)
watch(selected, s=>props.changeSelected(s))
watch([color, alpha], ()=>props.changeColor())
watch(name, name=>props.changeName(name))
</script>
<template>
	<ElmSelect v-model="selected" :elements />
	<CustomizeColor v-model="color" />
	<CustomColorAlpha v-model="alpha" />
	<CustomizeName v-model="name" />
</template>
