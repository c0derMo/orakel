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
            <div
                class="text-weight-thin text-italic q-mx-auto q-mt-xs small-text"
            >
                Match {{ game.matchNumber }}
            </div>

            <div class="row justify-center q-gutter-sm">
                <div
                    class="score text-right"
                    :class="{
                        win: isWinner(0),
                        loss: hasResult && !isWinner(0),
                    }"
                >
                    {{ game.result?.scores[0] }}
                </div>
                <span>:</span>
                <div
                    class="score"
                    :class="{
                        win: isWinner(1),
                        loss: hasResult && !isWinner(1),
                    }"
                >
                    {{ game.result?.scores[1] }}
                </div>
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
                    <span v-else class="text-italic small-text">
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
                    <span v-else class="text-italic small-text">
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
import { computed } from "vue";

const participantNames = useParticipantNames();

const props = defineProps<{
    game: IStageGame;
    hasSucceedingMatches: boolean;
    stageNumber: number;
}>();

function isWinner(index: number): boolean {
    return props.game.result?.ranking[0] === index;
}

const hasResult = computed<boolean>(() => {
    return props.game.result != null;
});
</script>

<style scoped>
.box {
    width: 17rem;
    border: 1px solid white;
    border-radius: 0.5rem;
}

.small-text {
    font-size: 12px;
    color: #999999;
}

.score {
    min-width: 1rem;
    border-radius: 25%;
    padding-left: 3px;
    padding-right: 3px;
    background-color: #333333;
}

.score.win {
    background-color: #c9a227;
    color: black;
}

.score.loss {
    background-color: #aaaaaa;
    color: black;
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
