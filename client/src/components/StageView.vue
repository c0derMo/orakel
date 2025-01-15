<template>
    <div class="column q-gutter-sm">
        <h3>{{ stage.name }}</h3>
        <div class="row q-gutter-md">
            <div v-for="group in gameGroups">
                <div>{{ group.title }}</div>

                <div style="border: 1px solid white;" v-for="game in gamesOfGroup(group)">
                    Game {{ game.matchNumber }}
                    {{ game.participantIds[0] ?? game.templateParticipantNames[0] }}
                    {{ game.participantIds[1] ?? game.templateParticipantNames[1] }}
                    <template v-if="game.result != null">
                        Score: {{ game.result.scores[0] }} - {{ game.result.scores[1] }}
                    </template>
                </div>
            </div>

            <div v-if="gamesOfGroup(null).length > 0">
                <div></div>

                <div style="border: 1px solid white;" v-for="game in gamesOfGroup(null)">
                    Game {{ game.matchNumber }}
                    {{ game.participantIds[0] ?? game.templateParticipantNames[0] }}
                    {{ game.participantIds[1] ?? game.templateParticipantNames[1] }}
                    <template v-if="game.result != null">
                        Score: {{ game.result.scores[0] }} - {{ game.result.scores[1] }}
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ITournamentStage } from '@shared/interfaces/ITournamentStage';
import type { IStageGame, IStageGameGroup } from '@shared/interfaces/IStageGame';
import { useAPI } from '../composables/http';

const props = defineProps<{
    stage: ITournamentStage,
}>();

const games: IStageGame[] = await useAPI().fetch<IStageGame[]>(`/api/tournament/${props.stage.tournamentId}/stages/${props.stage.stageNumber}/games`);
const gameGroups = await useAPI().fetch<IStageGame[]>(`/api/tournament/${props.stage.tournamentId}/stages/${props.stage.stageNumber}/gameGroups`);

function gamesOfGroup(group: IStageGameGroup | null): IStageGame[] {
    return games.filter((game) => game.groupNumber === (group?.groupNumber ?? undefined));
}
</script>