<template>
    <div class="column box">
        <span class="text-weight-thin italic">Match {{ game.matchNumber }}</span>

        <div class="row justify-center q-gutter-sm">
            <div class="score">{{ game.result?.scores[0] }}</div>
            <span>:</span>
            <div class="score">{{ game.result?.scores[1] }}</div>
        </div>

        <div class="row justify-center q-gutter-md">
            <div>{{ game.participantIds[0] ?? game.templateParticipantNames[0] }}</div>
            <div>{{ game.participantIds[1] ?? game.templateParticipantNames[1] }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IStageGame } from '@shared/interfaces/IStageGame';

defineProps<{
    game: IStageGame
}>();
</script>

<style scoped>
.box {
    width: 17rem;
    border: 1px solid white;
    border-radius: 0.5rem;
}
.italic {
    font-style: italic;
}

.score {
    background-color: white;
    color: black;
    min-width: 1rem;
}
</style>