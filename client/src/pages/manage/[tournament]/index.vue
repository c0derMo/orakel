<template>
    <div class="w-full">Poggers content</div>
</template>

<script setup lang="ts">
const emits = defineEmits<{
    setPageTitle: [title: string];
}>();

emits("setPageTitle", "");
</script>
