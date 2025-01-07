<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

import AppSizes from './AppSizes.vue'
import ZoomSizes from './ZoomSizes.vue'
import FpsRadio from './FpsRadio.vue'
import ShTargeter from './ShTargeter.vue'
import ShFocusBox from './ShFocusBox.vue'
import PixelCounterT from './PixelCounterT.vue'

const emit = defineEmits<{
	(e: 'changeFps', fps: number, unlimited: boolean): type
}>()

const unlimitedFps = defineModel<boolean>("unlimitedFps")
const size = defineModel("size")
const zoomSize = defineModel("zoomSize")
const shTargeter = defineModel("shTargeter")
const shFocusBox = defineModel("shFocusBox")
const pixelCounterT = defineModel("pixelCounterT")
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- fps default
const fpsAmount = ref(60)
watch(
	[fpsAmount, unlimitedFps],
	([fps, unl])=> emit('changeFps', fps, unl)
)
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
