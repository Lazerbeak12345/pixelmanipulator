<script setup lang="ts">
import { watch, computed } from 'vue'
import { storeToRefs } from 'pinia'

import ElmSelect from '../ElmSelect.vue'
import CustomizeColor from './CustomizeColor.vue'
import CustomColorAlpha from './CustomColorAlpha.vue'
import CustomizeName from './CustomizeName.vue'

const props = defineProps([
	// TODO: move state into better place
	'useSideAccordionStore',
	// TODO: move state into better place
	'useElementsStore',
	// TODO: convert to emit
	'changeColor',
	// TODO: convert to emit
	'changeName'
])
const elementsStore = props.useElementsStore()
const sideAccordionStore = props.useSideAccordionStore()

const { customize } = storeToRefs(sideAccordionStore)
const { elements } = storeToRefs(elementsStore)
// v-model doesn't like deep refs. This effectively flattens a deep ref.
function flattenDeep<A>(name: string): ReturnType<typeof computed<A>> {
	return computed({
		get() { return customize.value[name] },
		set(v) { customize.value[name] = v }
	})
}
const selected = flattenDeep("selected")
const color = flattenDeep("color")
const alpha = flattenDeep("alpha")
const name = flattenDeep("name")

watch(selected, ()=>sideAccordionStore.customize.updateCustomizer())
watch([color, alpha], ()=>props.changeColor({
	selected: selected.value,
	color: color.value,
	alpha: alpha.value,
}))
watch(name, name=>props.changeName(name))
</script>
<template>
	<ElmSelect v-model="selected" :elements />
	<CustomizeColor v-model="color" />
	<CustomColorAlpha v-model="alpha" />
	<CustomizeName v-model="name" />
</template>
