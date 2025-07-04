<template>
    <div class="row no-wrap">
        <div
            class="connecting-tab left"
            :class="
                game.precessorGames.filter((game) => game != null).length > 0
                    ? 'visible'
                    : ''
            "
        ></div>

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
                                stageNumber,
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
                                stageNumber,
                            )
                        }}
                    </template>
                    <span v-else class="text-italic">
                        {{ game.templateParticipantNames[1] }}
                    </span>
                </div>
            </div>
        </div>

        <div
            class="connecting-tab right"
            :class="hasSucceedingMatches ? 'visible' : ''"
        ></div>
    </div>
</template>

<script setup lang="ts">
import type { IStageGame } from "@shared/interfaces/IStageGame";
import { useParticipantNames } from "../composables/participantNames";

const participantNames = useParticipantNames();

defineProps<{
    game: IStageGame;
    hasSucceedingMatches: boolean;
    stageNumber: number;
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

.connecting-tab {
    height: 50%;
    width: 20px;
}
.connecting-tab.visible {
    border-bottom: 1px solid white;
}
.connecting-tab.left {
    margin-right: 15px;
}
.connecting-tab.right {
    margin-left: 15px;
}
</style>
