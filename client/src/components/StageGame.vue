<template>
    <div class="column box">
        <span class="text-weight-thin italic">
            Match {{ game.matchNumber }}
        </span>

        <div class="row justify-center q-gutter-sm">
            <div class="score">{{ game.result?.scores[0] }}</div>
            <span>:</span>
            <div class="score">{{ game.result?.scores[1] }}</div>
        </div>

        <div class="row justify-center q-gutter-md">
            <div>
                <template v-if="game.participantIds[0] != null">
                    {{
                        participantNames.getParticipantName(
                            game.tournamentId,
                            game.participantIds[0],
                        )
                    }}
                </template>
                <span v-else class="text-italic">
                    {{ game.templateParticipantNames[0] }}
                </span>
            </div>
            <div>
                <template v-if="game.participantIds[1] != null">
                    {{
                        participantNames.getParticipantName(
                            game.tournamentId,
                            game.participantIds[1],
                        )
                    }}
                </template>
                <span v-else class="text-italic">
                    {{ game.templateParticipantNames[1] }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IStageGame } from "@shared/interfaces/IStageGame";
import { useParticipantNames } from "../composables/participantNames";

const participantNames = useParticipantNames();

defineProps<{
    game: IStageGame;
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
