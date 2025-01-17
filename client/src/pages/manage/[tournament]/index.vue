<template>
    <ManageLayout :tournament="tournament"> Poggers content </ManageLayout>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAPI } from "../../../composables/http";
import type { ITournament } from "@shared/interfaces/ITournament";

const route = useRoute();

const tournament = await useAPI().fetch<ITournament>(
    `/api/tournament/${(route.params as { tournament: string }).tournament}`,
);
</script>
