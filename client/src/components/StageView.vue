<template>
    <div class="column q-gutter-sm">
        <h3>{{ stage.name }}</h3>
        <div class="row q-gutter-xl">
            <template v-for="(group, idx) in gameGroups" :key="idx">
                <div>
                    <div>{{ group.title }}</div>

                    <div class="row h-full">
                        <div class="match-connector-container">
                            <template
                                v-for="game in gamesOfGroup(group.groupNumber)"
                            >
                                <div
                                    v-for="precessorMatch in game.precessorGames"
                                    :key="`${game.matchNumber}-${precessorMatch}`"
                                    class="match-connector top"
                                    :style="
                                        calculateMatchConnectorCSS(
                                            game,
                                            precessorMatch,
                                        )
                                    "
                                />
                            </template>
                        </div>

                        <div
                            class="column justify-around h-full"
                            :data-orakel-group="idx"
                        >
                            <StageGame
                                v-for="game in gamesOfGroup(group.groupNumber)"
                                :key="game.matchNumber"
                                :game="game"
                                :data-orakel-match="
                                    games.findIndex(
                                        (g) =>
                                            g.matchNumber === game.matchNumber,
                                    )
                                "
                            />
                        </div>
                    </div>
                </div>
            </template>

            <div v-if="gamesOfGroup(null).length > 0">
                <div />

                <StageGame
                    v-for="game in gamesOfGroup(null)"
                    :key="game.matchNumber"
                    :game="game"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import type {
    IStageGame,
    IStageGameGroup,
} from "@shared/interfaces/IStageGame";
import { useAPI } from "../composables/http";
import { ref, onMounted } from "vue";

const props = defineProps<{
    stage: ITournamentStage;
}>();

const games = await useAPI().fetch<IStageGame[]>(
    `/api/tournament/${props.stage.tournamentId}/stages/${props.stage.stageNumber}/games`,
);
const gameGroups = await useAPI().fetch<IStageGameGroup[]>(
    `/api/tournament/${props.stage.tournamentId}/stages/${props.stage.stageNumber}/gameGroups`,
);

const gameHeights = ref(games.map(() => 65));
const gameTops = ref(games.map(() => 0));
const groupTops = ref(gameGroups.map(() => 0));

function gamesOfGroup(groupNumber: number | null): IStageGame[] {
    return games.filter(
        (game) => game.groupNumber === (groupNumber ?? undefined),
    );
}

function calculateMatchConnectorCSS(
    match: IStageGame,
    precessorMatch: number,
): string {
    if (match.groupNumber == null) {
        return "";
    }

    const precessorGame = games.find(
        (game) => game.matchNumber === precessorMatch,
    );

    if (precessorGame == null || precessorGame.groupNumber == null) {
        console.log("Waaa");
        return "";
    }

    const precessorGameIndex = games.findIndex(
        (game) => game.matchNumber === precessorMatch,
    );
    const currentGameIndex = games.findIndex(
        (game) => game.matchNumber === match.matchNumber,
    );

    const precessorGroupIndex = gameGroups.findIndex(
        (group) => group.groupNumber === precessorGame.groupNumber,
    );
    const currentGroupIndex = gameGroups.findIndex(
        (group) => group.groupNumber === match.groupNumber,
    );

    if (
        precessorGameIndex < 0 ||
        currentGameIndex < 0 ||
        precessorGroupIndex < 0 ||
        currentGroupIndex < 0
    ) {
        console.log("Not like this");
        return "";
    }

    const precessorGameHeight =
        gameTops.value[precessorGameIndex] -
        groupTops.value[precessorGroupIndex] +
        gameHeights.value[precessorGameIndex] * 0.5;
    const currentGameHeight =
        gameTops.value[currentGameIndex] -
        groupTops.value[currentGroupIndex] +
        gameHeights.value[currentGameIndex] * 0.5;

    if (precessorGameHeight < currentGameHeight) {
        return `top: ${precessorGameHeight}px; height: ${currentGameHeight - precessorGameHeight}px; --top-left: -10px;`;
    } else {
        return `top: ${currentGameHeight}px; height: ${precessorGameHeight - currentGameHeight}px; --bottom-left: -10px;`;
    }
}

onMounted(() => {
    for (let i = 0; i < games.length; i++) {
        gameHeights.value[i] =
            document
                .querySelector(`div[data-orakel-match="${i}"]`)
                ?.getBoundingClientRect().height ?? 65;
        gameTops.value[i] =
            document
                .querySelector(`div[data-orakel-match="${i}"]`)
                ?.getBoundingClientRect().top ?? 0;
    }
    for (let i = 0; i < gameGroups.length; i++) {
        groupTops.value[i] =
            document
                .querySelector(`div[data-orakel-group="${i}"]`)
                ?.getBoundingClientRect().top ?? 0;
    }
});
</script>

<style scoped>
.h-full {
    height: 100%;
}

.match-connector {
    position: absolute;
    border-left: 1px solid white;
    left: -24px;

    &:after {
        position: absolute;
        content: " ";
        width: 10px;
        display: block;
        height: 100%;
        border-bottom: 1px solid white;
        left: var(--bottom-left);
    }

    &:before {
        position: absolute;
        content: " ";
        width: 10px;
        display: block;
        height: 100%;
        border-top: 1px solid white;
        left: var(--top-left);
    }
}

.match-connector-container {
    position: relative;
}
</style>
