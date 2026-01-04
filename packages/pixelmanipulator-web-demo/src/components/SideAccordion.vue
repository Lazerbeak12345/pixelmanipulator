<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import 'bootstrap/js/dist/collapse' // For #sideAccordion

import AppSettings from './settings/AppSettings.vue'
import ElementCustomize from './customize/ElementCustomize.vue'
import AppElements from './AppElements.vue'

const props = defineProps([
	// TODO: move state into better place
	'useSideAccordionStore',
	// TODO: move state into better place
	'useElementsStore',
	// TODO: convert to emit
	'changeFps',
	// TODO: convert to emit
	'changeTargeter',
	// TODO: convert to emit
	'changePixelCounterT',
	// TODO: convert to emit
	'changeColor',
	// TODO: convert to emit
	'changeName',
	// TODO: convert to emit
	'clickFill',
])

const sideAccordionStore = props.useSideAccordionStore()
const elementStore = props.useElementsStore()

const { fills, customize, settings } = storeToRefs(sideAccordionStore)
const { elements } = storeToRefs(elementStore)

watch(
	()=> settings.value.shTargeter,
	c=> props.changeTargeter(c)
)
watch(
	()=> settings.value.pixelCounterT,
	c => props.changePixelCounterT(c)
)
</script>
<template>
	<div class="accordion" id="sideAccordion">
		<section class="accordion-item" aria-labelledby="elements-header">
			<h2 id="elements-header" class="accordion-header">
				<button
					class="accordion-button"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#elements"
					aria-expanded="true"
					aria-controls="elements"
				>
					<i class="fa-solid fa-mouse" aria-hidden="true"></i>
					&nbsp;
					Elements
				</button>
			</h2>
			<div id="elements" class="accordion-collapse collapse show" aria-labelledby="elements-header" data-bs-parent="#sideAccordion">
				<div class="accordion-body">
					<AppElements
						:elements
						:normalFill="fills.normalFill"
						:ctrlFill="fills.ctrlFill"
						:altFill="fills.altFill"
						@click="clickFill"
					/>
				</div>
			</div>
		</section>
		<section class="accordion-item" aria-labelledby="customize-header">
			<h2 class="accordion-header" id="customize-header">
				<button
					class="accordion-button collapsed"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#customize"
					aria-expanded="false"
					aria-controls="customize"
				>
					<i class="fa-solid fa-edit" aria-hidden="true"></i>
					&nbsp;
					Customize
				</button>
			</h2>
			<div id="customize" class="accordion-collapse collapse" aria-labelledby="customize-header" data-bs-parent="#sideAccordion">
				<div class="accordion-body">
					<ElementCustomize
						:elements
						@changeColor="changeColor"
						@changeName="changeName"
						v-model="customize.selected"
						:elm="customize.elm"
					/>
				</div>
			</div>
		</section>
		<section class="accordion-item" aria-labelledby="settings-header">
			<h2 class="accordion-header" id="settings-header">
				<button
					class="accordion-button collapsed"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#settings"
					aria-expanded="false"
					aria-controls="customize"
				>
					<i class="fa-solid fa-gears" aria-hidden="true"></i>
					&nbsp;
					Settings
				</button>
			</h2>
			<div id="settings" class="accordion-collapse collapse" aria-labeledby="accordion-header" data-bs-parent="#sideAccordion">
				<div class="accordion-body">
					<AppSettings
						v-model:unlimitedFps="settings.unlimitedFps"
						v-model:size="settings.size"
						v-model:zoomSize="settings.zoomSize"
						v-model:shTargeter="settings.shTargeter"
						v-model:shFocusBox="settings.shFocusBox"
						v-model:pixelCounterT="settings.pixelCounterT"
						@changeFps="changeFps"
					/>
				</div>
			</div>
		</section>
	</div>
</template>
