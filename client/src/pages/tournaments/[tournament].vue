<template>
    <DefaultLayout>
        <div class="column">
            <h1>{{ tournament.name }}</h1>
    
            <StageView v-for="stage in stages" :stage="stage" />
        </div>
    </DefaultLayout>
</template>

<script setup lang="ts">
import { ITournament } from "@shared/interfaces/ITournament";
import { useAPI } from "../../composables/http";
import { useRoute } from "vue-router"
import { ITournamentStage } from "@shared/interfaces/ITournamentStage";

const route = useRoute();

const tournament = await useAPI().fetch<ITournament>(`/api/tournament/${route.params.tournament}`);

const stages = await useAPI().fetch<ITournamentStage[]>(`/api/tournament/${tournament.id}/stages`);
</script>