<template>
    <q-dialog v-model="show" @hide="$emit('close')">
        <q-card style="width: 50%">
            <q-card-section>
                <div class="text-h6">Edit Match Report</div>
            </q-card-section>

            <q-card-section>
                <q-form @submit="editMatchReport">
                    <q-markup-table class="q-mb-xs">
                        <thead>
                            <tr>
                                <th>Participant</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(
                                    participant, idx
                                ) in match.participantIds"
                                :key="idx"
                            >
                                <td v-if="participant == null">
                                    unknown participant
                                </td>
                                <td v-else>
                                    {{
                                        participantNames.getParticipantName(
                                            match.tournamentId,
                                            participant,
                                        )
                                    }}
                                </td>
                                <td>
                                    <q-input
                                        v-model="editable.scores[idx]"
                                        type="number"
                                    ></q-input>
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>

                    <q-banner
                        v-if="match.participantIds.some((p) => p == null)"
                        class="bg-red"
                    >
                        You are editing a match which doesn't have all
                        participants assigned. This can lead to undesired
                        results.
                    </q-banner>

                    <q-btn type="submit">Edit</q-btn>
                    <q-btn @click="close">Cancel</q-btn>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { useParticipantNames } from "../composables/participantNames";
import { useAPI } from "../composables/http";
import { ref, toRaw } from "vue";
import type { IGameReport, IStageGame } from "@shared/interfaces/IStageGame";

const participantNames = useParticipantNames();

const show = ref(true);

const props = defineProps<{
    matchReport: IGameReport;
    match: IStageGame;
}>();
const editable = ref(structuredClone(toRaw(props.matchReport)));
defineEmits<{
    close: [];
}>();

async function editMatchReport() {
    editable.value.scores = editable.value.scores.map((p) =>
        parseInt(p.toString()),
    );
    await useAPI().fetch(
        `/api/tournament/${props.match.tournamentId}/stages/${props.match.stageNumber}/reports`,
        {
            method: "PATCH",
            body: editable.value,
        },
    );
    close();
}

function close() {
    show.value = false;
}
</script>
