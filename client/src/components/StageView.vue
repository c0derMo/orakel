<template>
    <div ref="stageBox" class="column q-gutter-md q-pt-sm">
        <h3 style="margin-bottom: 0">{{ stage.name }}</h3>
        <div class="row no-wrap flex-grow box">
            <template v-for="(group, idx) in gameGroups" :key="idx">
                <div class="column">
                    <div>{{ group.title }}</div>

                    <div class="row flex-grow">
                        <div class="match-connector-container">
                            <template
                                v-for="game in gamesOfGroup(group.groupNumber)"
                            >
                                <div
                                    v-for="precessorMatch in game.precessorGames.filter(
                                        (game) => game != null,
                                    )"
                                    :key="`${game.matchNumber}-${precessorMatch}`"
                                    class="match-connector"
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
                            class="column justify-around"
                            :data-orakel-group="idx"
                        >
                            <StageGame
                                v-for="game in gamesOfGroup(group.groupNumber)"
                                :key="game.matchNumber"
                                :game="game"
                                :stage-number="stage.stageNumber"
                                :data-orakel-match="
                                    games.findIndex(
                                        (g) =>
                                            g.matchNumber === game.matchNumber,
                                    )
                                "
                                :has-succeeding-matches="
                                    allPreceedingMatches.includes(
                                        game.matchNumber,
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
                    :has-succeeding-matches="
                        allPreceedingMatches.includes(game.matchNumber)
                    "
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
import { ref, onMounted, computed } from "vue";
import { useParticipantNames } from "../composables/participantNames";

const props = defineProps<{
    stage: ITournamentStage;
}>();

await useParticipantNames().loadStage(
    props.stage.tournamentId,
    props.stage.stageNumber,
);

const games = await useAPI().fetch<IStageGame[]>(
    `/api/tournament/${props.stage.tournamentId}/stages/${props.stage.stageNumber}/games`,
);
const gameGroups = await useAPI().fetch<IStageGameGroup[]>(
    `/api/tournament/${props.stage.tournamentId}/stages/${props.stage.stageNumber}/gameGroups`,
);

const gameHeights = ref(games.map(() => 65));
const gameTops = ref(games.map(() => 0));
const groupTops = ref(gameGroups.map(() => 0));
const stageBox = ref<HTMLDivElement | null>(null);

function gamesOfGroup(groupNumber: number | null): IStageGame[] {
    return games.filter(
        (game) => game.groupNumber === (groupNumber ?? undefined),
    );
}

const allPreceedingMatches = computed<number[]>(() => {
    return games
        .map((game) => game.precessorGames.filter((match) => match != null))
        .reduce((l, r) => [...l, ...r], []);
});

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
        return `top: ${precessorGameHeight}px; height: ${currentGameHeight - precessorGameHeight}px;`;
    } else {
        return `top: ${currentGameHeight}px; height: ${precessorGameHeight - currentGameHeight}px;`;
    }
}

onMounted(() => {
    for (let i = 0; i < games.length; i++) {
        gameHeights.value[i] =
            stageBox.value
                ?.querySelector(`div[data-orakel-match="${i}"]`)
                ?.getBoundingClientRect().height ?? 65;
        gameTops.value[i] =
            stageBox.value
                ?.querySelector(`div[data-orakel-match="${i}"]`)
                ?.getBoundingClientRect().top ?? 0;
    }
    for (let i = 0; i < gameGroups.length; i++) {
        groupTops.value[i] =
            stageBox.value
                ?.querySelector(`div[data-orakel-group="${i}"]`)
                ?.getBoundingClientRect().top ?? 0;
    }
});
</script>

<style scoped>
.match-connector {
    position: absolute;
    border-left: 1px solid white;
}

.match-connector-container {
    position: relative;
}

.box {
    max-width: 80vw;
    overflow-x: auto;
}
</style>
