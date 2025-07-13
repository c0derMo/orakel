<template>
    <div class="w-full">
        <TournamentParticipantEditDialog
            v-if="participantToEdit != null"
            :participant="participantToEdit"
            @close="editorClosed"
        />
        <div class="column w-full">
            <q-card>
                <q-card-section>
                    <div class="row">
                        <q-input
                            v-model="newParticipant"
                            outlined
                            label="Add new participant"
                            class="flex-grow"
                        />
                        <q-btn
                            flat
                            icon="add"
                            color="green"
                            @click="addParticipant"
                        />
                    </div>
                </q-card-section>

                <q-card-section>
                    <q-markup-table>
                        <thead>
                            <tr>
                                <th>Participant ID</th>
                                <th>Participant Name</th>
                                <th>Linked Orakel User</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="participant in participants"
                                :key="participant.participantId"
                            >
                                <td>{{ participant.participantId }}</td>
                                <td>{{ participant.username }}</td>
                                <td>
                                    <!-- TODO -->
                                </td>
                                <td>
                                    <q-btn round flat icon="more_vert">
                                        <q-menu>
                                            <q-list>
                                                <q-item
                                                    v-close-popup
                                                    clickable
                                                    @click="
                                                        participantToEdit =
                                                            participant
                                                    "
                                                >
                                                    <q-item-section side>
                                                        <q-icon name="edit" />
                                                    </q-item-section>
                                                    <q-item-section
                                                        >Edit</q-item-section
                                                    >
                                                </q-item>
                                                <q-item
                                                    v-close-popup
                                                    clickable
                                                    @click="
                                                        deleteParticipant(
                                                            participant,
                                                        )
                                                    "
                                                >
                                                    <q-item-section side>
                                                        <q-icon
                                                            name="delete"
                                                            color="red"
                                                        />
                                                    </q-item-section>
                                                    <q-item-section>
                                                        Delete
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
    </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAPI } from "../../../composables/http";
import type {
    ITournamentParticipant,
    ITournament,
} from "@shared/interfaces/ITournament";
import { ref } from "vue";

const route = useRoute();
const newParticipant = ref("");
const participants = ref<ITournamentParticipant[]>([]);
const participantToEdit = ref<ITournamentParticipant | null>(null);

const tournament = await useAPI().fetch<ITournament>(
    `/api/tournament/${(route.params as { tournament: string }).tournament}`,
);

const emits = defineEmits<{
    setPageTitle: [title: string];
}>();

emits("setPageTitle", "Tournament Participants");

async function updateParticipants() {
    participants.value = await useAPI().fetch(
        `/api/tournament/${tournament.id}/participants`,
    );
}

async function addParticipant() {
    await useAPI().fetch(`/api/tournament/${tournament.id}/participants`, {
        method: "PATCH",
        body: {
            username: newParticipant.value,
        },
    });
    newParticipant.value = "";
    await updateParticipants();
}

async function deleteParticipant(participant: ITournamentParticipant) {
    await useAPI().fetch(`/api/tournament/${tournament.id}/participants`, {
        method: "DELETE",
        body: {
            participantId: participant.participantId,
        },
    });
    await updateParticipants();
}

async function editorClosed() {
    participantToEdit.value = null;
    await updateParticipants();
}

await updateParticipants();
</script>
