<template>
    <DefaultLayout>
        <q-card>
            <q-card-section class="column q-gutter-sm q-ma-sm">
                <h3>Create a new tournament</h3>
                <q-form @submit="submitForm">
                    <q-input
                        v-model="tournamentName"
                        label="Tournament name"
                        :rules="[validateNonEmpty]"
                        @blur="updateEmptyURL"
                    />
                    <q-input v-model="username" label="Owner" readonly />
                    <q-input
                        v-model="url"
                        label="URL"
                        :prefix="urlPrefix"
                        :rules="[validateURLPart, validateNonEmpty]"
                    />
                    <q-toggle
                        v-model="privateTournament"
                        label="Private tournament"
                    />

                    <div>
                        <q-btn type="submit">Create</q-btn>
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </DefaultLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAPI } from "../../composables/http";
import { useUserStore } from "../../composables/userStore";
import { useRouter } from "vue-router";
import { validateNonEmpty, validateURLPart } from "../../utils/validationRules";

const userStore = useUserStore();
const router = useRouter();

const tournamentName = ref("");
const username = ref("");
const url = ref("");
const privateTournament = ref(false);

if (!userStore.isLoggedIn) {
    await router.push("/login");
} else {
    username.value = userStore.user!.username;
}

const urlPrefix = new URL(window.location).origin + "/tournaments/";

async function submitForm() {
    try {
        const reply = await useAPI().fetch<string>("/api/tournament/", {
            method: "PUT",
            body: {
                name: tournamentName.value,
                urlName: url.value,
                private: privateTournament.value,
            },
        });
        alert(`The tournament was created with the id ${reply}`);
    } catch {
        alert("An error occured while trying to create a tournament.");
    }
}

function updateEmptyURL() {
    if (url.value !== "") {
        return;
    }
    url.value = tournamentName.value
        .replace(/\W/g, "_")
        .replace(/_+/g, "_")
        .replace(/_*$/g, "");
}
</script>
