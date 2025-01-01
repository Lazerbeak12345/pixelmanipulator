<script setup lang="ts">
const props = defineProps(['useTargeterLocStore'])
const targeterLoc = props.useTargeterLocStore()
</script>
<template>
	Targeter:
	<ul class="list-group">
		<li class="list-group-item">
			x: <span class="badge bg-secondary">{{targeterLoc.x}}</span>
		</li>
		<li class="list-group-item">
			y: <span class="badge bg-secondary">{{targeterLoc.y}}</span>
		</li>
	</ul>
</template>
