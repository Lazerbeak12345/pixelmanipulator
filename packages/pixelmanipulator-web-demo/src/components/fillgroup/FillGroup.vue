<script setup lang="ts">
import { watch, ref } from 'vue'
import { storeToRefs } from 'pinia'

import ElmSelect from '../ElmSelect.vue'
import FillButton from './FillButton.vue'
import FillP from './FillP.vue'

const props = defineProps<{
	elements: string[]
}>()
const emit = defineEmits<{
	(e: 'click', element: string, percent: number): void
}>()
const selected = defineModel<number>("selected")
const percent = defineModel<number>("percent")
</script>
<template>
	<div class="click-type-random input-group">
		<ElmSelect v-model="selected" :elements />
		<FillButton @click="emit('click', selected, percent)" />
		<FillP v-model="percent" />
		<span class="input-group-text">%</span>
	</div>
</template>
