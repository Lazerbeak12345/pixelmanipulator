<script setup lang="ts">
const percent = defineModel<number>()
</script>
<template>
	<input class="form-control" type="number" value="15" placeholder="15" v-model="percent"/>
</template>
