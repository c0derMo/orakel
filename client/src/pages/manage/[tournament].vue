<template>
    <ManageLayout
        :tournament="tournament"
        :title="pageTitle !== '' ? pageTitle : undefined"
    >
        <RouterView @set-page-title="setPageTitle" />
    </ManageLayout>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAPI } from "../../composables/http";
import type { ITournament } from "@shared/interfaces/ITournament";
import { ref } from "vue";

const route = useRoute();

const tournament = await useAPI().fetch<ITournament>(
    `/api/tournament/${(route.params as { tournament: string }).tournament}`,
);

const pageTitle = ref("");

function setPageTitle(title: string) {
    pageTitle.value = title;
}
</script>
