<script setup lang="ts">
const props = defineProps([
	// TODO: convert to emit
	'click'
])
const emit = defineEmits<{
	(e: 'click'): void
}>()
</script>
<template>
	<button
		class="btn btn-outline-secondary"
		type="button"
		title="Randomly fill"
		@click="emit('click')"
	>
		<i class="fa-solid fa-fill-drip" aria-hidden="true"></i>
		<span class="visually-hidden">
			Randomly fill
		</span>
	</button>
</template>
