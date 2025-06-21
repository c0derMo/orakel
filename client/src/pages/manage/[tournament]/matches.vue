<template>
    <ManageLayout :tournament="tournament" title="Matches">
        <TournamentMatchEditDialog
            v-if="matchToEdit != null && reportToEdit != null"
            :match-report="reportToEdit"
            :match="matchToEdit"
            @close="editorClosed"
        />
        <div class="column w-full">
            <q-card>
                <q-card-section>
                    <div class="row">
                        <q-select
                            v-model="filteredStage"
                            :options="stages"
                            option-label="name"
                            label="Only show stage"
                            class="flex-grow"
                            clearable
                        />
                        <q-toggle
                            v-model="includeCompleted"
                            label="Include completed"
                        />
                        <q-toggle
                            v-model="includeMissing"
                            label="Include matches with missing players"
                        />
                    </div>
                </q-card-section>

                <q-card-section>
                    <q-markup-table>
                        <thead>
                            <tr>
                                <th>Stage</th>
                                <th>Match number</th>
                                <th>Players</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(match, idx) in filteredMatches"
                                :key="idx"
                            >
                                <td>
                                    {{
                                        resolveStageName(
                                            match.stageNumber,
                                            match.groupNumber,
                                        )
                                    }}
                                </td>
                                <td>{{ match.matchNumber }}</td>
                                <td>{{ resolveParticipantNames(match) }}</td>
                                <td>
                                    <q-btn round flat icon="more_vert">
                                        <q-menu>
                                            <q-list>
                                                <q-item
                                                    v-close-popup
                                                    clickable
                                                    @click="openEditor(match)"
                                                >
                                                    <q-item-section side>
                                                        <q-icon name="edit" />
                                                    </q-item-section>
                                                    <q-item-section>
                                                        Edit
                                                    </q-item-section>
                                                </q-item>
                                            </q-list>
                                        </q-menu>
                                    </q-btn>
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>
                </q-card-section>
            </q-card>
        </div>
    </ManageLayout>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAPI } from "../../../composables/http";
import { useParticipantNames } from "../../../composables/participantNames";
import type { ITournament } from "@shared/interfaces/ITournament";
import type { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import type {
    IStageGame,
    IGameReport,
    IStageGameGroup,
} from "@shared/interfaces/IStageGame";
import { ref, computed } from "vue";

const route = useRoute();
const participantNames = useParticipantNames();
const api = useAPI();

const tournament = await api.fetch<ITournament>(
    `/api/tournament/${(route.params as { tournament: string }).tournament}`,
);

await participantNames.loadTournament(tournament.id);

const filteredStage = ref<ITournamentStage | null>(null);
const includeCompleted = ref(false);
const includeMissing = ref(false);
const reportToEdit = ref<IGameReport | null>(null);
const matchToEdit = ref<IStageGame | null>(null);

const matches = ref<IStageGame[]>([]);

const stages = await api.fetch<ITournamentStage[]>(
    `/api/tournament/${tournament.id}/stages`,
);

const matchGroups = ref<Record<number, IStageGameGroup[]>>({});

for (const stage of stages) {
    matchGroups.value[stage.stageNumber] = await api.fetch<IStageGameGroup[]>(
        `/api/tournament/${tournament.id}/stages/${stage.stageNumber}/gameGroups`,
    );
}

const filteredMatches = computed(() => {
    let result = [...matches.value];

    if (filteredStage.value != null) {
        result = result.filter(
            (match) => match.stageNumber === filteredStage.value!.stageNumber,
        );
    }
    if (!includeCompleted.value) {
        result = result.filter((match) => match.result == null);
    }
    if (!includeMissing.value) {
        result = result.filter((match) =>
            match.participantIds.every((p) => p != null),
        );
    }

    return result;
});

function resolveParticipantNames(match: IStageGame): string {
    const resultingNames: string[] = [];
    for (let idx = 0; idx < match.participantIds.length; idx++) {
        if (match.participantIds[idx] == null) {
            resultingNames.push(match.templateParticipantNames[idx]);
        } else {
            resultingNames.push(
                participantNames.getParticipantName(
                    tournament.id,
                    match.participantIds[idx]!,
                ),
            );
        }
    }
    return resultingNames.join(", ");
}

function resolveStageName(stageNumber: number, groupNumber?: number) {
    const stageName = stages.find(
        (stage) => stage.stageNumber === stageNumber,
    )!.name;
    if (groupNumber != null) {
        const groupName = matchGroups.value[stageNumber].find(
            (group) => group.groupNumber === groupNumber,
        )!.title;
        return `${stageName} - ${groupName}`;
    }
    return stageName;
}

async function updateMatches(): Promise<void> {
    for (const stage of stages) {
        matches.value.push(
            ...(await api.fetch<IStageGame[]>(
                `/api/tournament/${tournament.id}/stages/${stage.stageNumber}/games`,
            )),
        );
    }
}

function openEditor(match: IStageGame) {
    matchToEdit.value = match;
    if (match.result == null) {
        reportToEdit.value = {
            tournamentId: match.tournamentId,
            stageNumber: match.stageNumber,
            matchNumber: match.matchNumber,
            scores: match.participantIds.map(() => 0),
            ranking: match.participantIds.map((_, idx) => idx),
        };
    } else {
        reportToEdit.value = match.result;
    }
}

async function editorClosed() {
    reportToEdit.value = null;
    matchToEdit.value = null;
    await updateMatches();
}

await updateMatches();
</script>
