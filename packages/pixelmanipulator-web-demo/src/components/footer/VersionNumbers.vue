<script lang="ts" setup>
import { version as pm_version } from 'pixelmanipulator'
import * as package_json from '../../../package.json'
</script>
<template>
	Library v{{pm_version}},
	Web Demo v{{package_json.version}}
</template>
