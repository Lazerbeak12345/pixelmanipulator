<script setup lang="ts">
import { watch, ref } from 'vue'
import { storeToRefs } from 'pinia'

import AppSizes from './AppSizes.vue'
import ZoomSizes from './ZoomSizes.vue'
import FpsRadio from './FpsRadio.vue'
import ShTargeter from './ShTargeter.vue'
import ShFocusBox from './ShFocusBox.vue'
import PixelCounterT from './PixelCounterT.vue'

const props = defineProps([
	// TODO: move state into better place
	'useSettingsStore',
	// TODO: convert to emit
	'changeFps',
	// TODO: convert to emit
	'changeUnlimited',
	// TODO: convert to emit
	'changeTargeter',
	// TODO: convert to emit
	'changePixelCounterT',
])
const sizesStore = props.useSettingsStore()
const {
	size,
	zoomSize,
	unlimitedFps,
	shTargeter,
	shFocusBox,
	pixelCounterT,
} = storeToRefs(sizesStore)
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- fps default
const fpsAmount = ref(60)
watch(fpsAmount, a=> props.changeFps(a))
watch(unlimitedFps, u=> props.changeUnlimited(u, fpsAmount.value))
watch(shTargeter, c=> props.changeTargeter(c))
watch(pixelCounterT, c => props.changePixelCounterT(c))
</script>
<template>
	<AppSizes v-model:w="size.w" v-model:h="size.h" />
	<ZoomSizes v-model:w="zoomSize.w" v-model:h="zoomSize.h" />
	<FpsRadio
		v-model:unlimited="unlimitedFps"
		v-model:fpsAmount="fpsAmount" />
	<ShTargeter v-model="shTargeter" />
	<ShFocusBox v-model="shFocusBox" />
	<PixelCounterT v-model="pixelCounterT" />
</template>
