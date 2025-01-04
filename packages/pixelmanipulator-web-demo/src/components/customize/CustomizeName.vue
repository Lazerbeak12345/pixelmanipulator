<script setup lang="ts">
const name = defineModel<string>()
</script>
<template>
	<label>
		<i class="fa-solid fa-tag" aria-hidden="true"></i>
		Change Name:
		<input type="text" class="form-control" v-model="name">
	</label>
</template>
