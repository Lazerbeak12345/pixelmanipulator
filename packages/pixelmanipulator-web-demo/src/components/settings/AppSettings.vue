<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

import AppSizes from './AppSizes.vue'
import ZoomSizes from './ZoomSizes.vue'
import FpsRadio from './FpsRadio.vue'
import ShTargeter from './ShTargeter.vue'
import ShFocusBox from './ShFocusBox.vue'
import PixelCounterT from './PixelCounterT.vue'

const props = defineProps([
	// TODO: move state into better place
	'useSideAccordionStore',
	// TODO: convert to emit
	'changeFps',
	// TODO: convert to emit
	'changeUnlimited',
	// TODO: convert to emit
	'changeTargeter',
	// TODO: convert to emit
	'changePixelCounterT',
])
const sideAccordionStore = props.useSideAccordionStore()
const { settings } = storeToRefs(sideAccordionStore)
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- fps default
const fpsAmount = ref(60)
// v-model doesn't like deep refs. This effectively flattens a deep ref.
function flattenDeep<A>(name: string): ReturnType<typeof computed<A>> {
	return computed({
		get() { return settings.value[name] },
		set(v) { settings.value[name] = v }
	})
}
const unlimitedFps = flattenDeep("unlimitedFps")
const size = flattenDeep("size")
const zoomSize = flattenDeep("zoomSize")
const shTargeter = flattenDeep("shTargeter")
const shFocusBox = flattenDeep("shFocusBox")
const pixelCounterT = flattenDeep("pixelCounterT")

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
