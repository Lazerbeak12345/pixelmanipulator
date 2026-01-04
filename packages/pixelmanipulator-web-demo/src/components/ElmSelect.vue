<script setup lang="ts">
import { watch } from 'vue'
const props = defineProps<{
	elements: string[]
}>()
const selected = defineModel<string>()
</script>
<template>
	<select class="form-select" v-model="selected">
		<option v-for="name in elements" :key="name">
			{{ name }}
		</option>
	</select>
</template>
