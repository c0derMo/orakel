<template>
    <div class="column q-gutter-sm">
        <h3>{{ stage.name }}</h3>
        <div class="row q-gutter-md">
            <template v-for="group in gameGroups">
                <div>
                    <template v-for="game in gamesOfGroup(group)">
                        <div
                            v-for="precessorMatch in game.precessorGames"
                            class="match-connector"
                            :style="calculateMatchConnectorCSS(game, precessorMatch)"
                        />
                    </template>
                </div>

                <div>
                    <div>{{ group.title }}</div>
    
                    <div class="column justify-around h-full" :data-group="group.groupNumber">
                        <StageGame
                            v-for="game in gamesOfGroup(group)"
                            :key="game.matchNumber"
                            :game="game"
                        />
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

const props = defineProps<{
    stage: ITournamentStage;
}>();

const games = await useAPI().fetch<IStageGame[]>(
    `/api/tournament/${props.stage.tournamentId}/stages/${props.stage.stageNumber}/games`,
);
const gameGroups = await useAPI().fetch<IStageGameGroup[]>(
    `/api/tournament/${props.stage.tournamentId}/stages/${props.stage.stageNumber}/gameGroups`,
);

function gamesOfGroup(group: IStageGameGroup | null): IStageGame[] {
    return games.filter(
        (game) => game.groupNumber === (group?.groupNumber ?? undefined),
    );
}

function calculateMatchConnectorCSS(match: IStageGame, precessorMatch: number): string {
    if (match.groupNumber == null) {
        return "";
    }
    const firstGameThisGroup = games.findIndex(
        (g) => g.groupNumber === match.groupNumber,
    );
    const gameNumberThisGroup = match.matchNumber - firstGameThisGroup - 1;
    const firstGamePreviousGroup = games.findIndex(
        (g) => g.groupNumber === match.groupNumber! - 1,
    );
    if (firstGamePreviousGroup === -1) {
        return "";
    }
    const gameNumberPreviousGroup = precessorMatch - firstGamePreviousGroup - 1;

    const matchHeight = 65;
    const groupHeight = document.querySelector(`div[data-group="${match.groupNumber! - 1}"]`)?.getBoundingClientRect().height;
    console.log(groupHeight);
    return "";
}
</script>

<style scoped>
.h-full {
    height: 100%;
}

.match-connector {
    border-left: 1px solid white;
}
</style>