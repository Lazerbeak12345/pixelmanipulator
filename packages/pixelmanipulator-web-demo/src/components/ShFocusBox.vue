<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
const props = defineProps([
	"useShFocusBoxStore"
])
const shFocusBoxStore = props.useShFocusBoxStore()
const { checked } = storeToRefs(shFocusBoxStore)
</script>
<template>
	<div class="form-check">
		<input class="form-check-input" id="shfocusbox" v-model="checked" type="checkbox">
		<label class="form-check-label" for="shfocusbox" title="Show focus box">
			<i class="fa-solid fa-square" aria-hidden="true"></i>
			Focus Box
		</label>
	</div>
</template>
