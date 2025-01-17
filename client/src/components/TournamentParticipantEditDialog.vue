<template>
    <q-dialog v-model="show" @hide="$emit('close')">
        <q-card style="width: 50%">
            <q-card-section>
                <div class="text-h6">Edit participant</div>
            </q-card-section>

            <q-card-section>
                <q-form @submit="editParticipant">
                    <q-input
                        v-model="editable.participantId"
                        label="Participant ID"
                        readonly
                    />
                    <q-input
                        v-model="editable.username"
                        label="Username"
                        :rules="[validateNonEmpty]"
                    />

                    <q-btn type="submit">Edit</q-btn>
                    <q-btn @click="close">Cancel</q-btn>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import type { ITournamentParticipant } from "@shared/interfaces/ITournament";
import { validateNonEmpty } from "../utils/validationRules";
import { useAPI } from "../composables/http";
import { ref, toRaw } from "vue";

const show = ref(true);

const props = defineProps<{
    participant: ITournamentParticipant;
}>();
const editable = ref(structuredClone(toRaw(props.participant)));
defineEmits<{
    close: [];
}>();

async function editParticipant() {
    await useAPI().fetch(
        `/api/tournament/${props.participant.tournamentId}/participants`,
        {
            method: "PATCH",
            body: {
                participantId: editable.value.participantId,
                username: editable.value.username,
            },
        },
    );
    close();
}

function close() {
    show.value = false;
}
</script>
