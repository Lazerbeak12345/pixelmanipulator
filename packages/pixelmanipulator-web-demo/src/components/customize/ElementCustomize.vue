<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { type ElementData } from 'pixelmanipulator'

import ElmSelect from '../ElmSelect.vue'
import CustomizeColor from './CustomizeColor.vue'
import CustomColorAlpha from './CustomColorAlpha.vue'
import CustomizeName from './CustomizeName.vue'

const props = defineProps<{
	elements: string[]
	elm: ElementData
}>()
const selected = defineModel<string>()
interface ChangeColor {
	selected: string
	renderAs: [number, number, number, number]
}
const emit = defineEmits<{
	(e: 'changeColor', data: ChangeColor): void,
	(e: 'changeName', data: { selected: string, name: string}): void,
}>()

/// Change the color
const color = ref('')
const alpha = ref("0")
/// Name of element
const name = ref("")
const elm = computed(()=> props.elm)
const renderAs = computed<void|[number, number, number, number]>(()=>{
  const matches = /#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(color.value)
  if (matches == null) return
  // The 0th is just the whole string
  const RED_IDX = 1
  const GREEN_IDX = 2
  const BLUE_IDX = 3
  const HEX_VALUES_PER_DIGIT = 16
  return [
    parseInt(matches[RED_IDX], HEX_VALUES_PER_DIGIT),
    parseInt(matches[GREEN_IDX], HEX_VALUES_PER_DIGIT),
    parseInt(matches[BLUE_IDX], HEX_VALUES_PER_DIGIT),
    parseInt(alpha.value)
  ]
})

watch(elm, elm=>{
  if (elm == null) return
  const { renderAs, name: n } = elm
  const DEFAULT_DOT = 255
  const START_OF_COLOR = 0
  const ALPHA_INDEX = 3
  const HEX_VALUES_PER_DIGIT = 16
  const DIGITS_PER_DOT = 2
  color.value = `#${renderAs.slice(START_OF_COLOR, ALPHA_INDEX).map(dot =>
	dot.toString(HEX_VALUES_PER_DIGIT).padStart(DIGITS_PER_DOT, '0')
  ).join('')}`
  alpha.value = (renderAs[ALPHA_INDEX] ?? DEFAULT_DOT).toString()
  name.value = n
})
watch(renderAs, renderAs=> renderAs && emit('changeColor', {
	selected: selected.value,
	renderAs
}))
watch(name, name=>emit('changeName', { name, selected: selected.value }))
</script>
<template>
	<ElmSelect v-model="selected" :elements />
	<CustomizeColor v-model="color" />
	<CustomColorAlpha v-model="alpha" />
	<CustomizeName v-model="name" />
</template>
