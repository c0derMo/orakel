<template>
    <DefaultLayout>
        <q-card class="card">
            <q-card-section class="column q-gutter-sm">
                <span v-if="errorMessage !== ''" class="text-negative">{{ errorMessage }}</span>

                <q-input v-model="username" label="Username" />
                <q-input v-model="password" :type="viewPW ? 'text' : 'password'" label="Password">
                    <template v-slot:append>
                        <q-icon
                            :name="viewPW ? 'visibility' : 'visibility_off'"
                            class="cursor-pointer"
                            @click="viewPW = !viewPW"
                        />
                    </template>
                </q-input>
                <q-btn flat @click="tryLogin">Login</q-btn>
            </q-card-section>
        </q-card>
    </DefaultLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAPI } from '../composables/http';
import { useUserStore } from '../composables/userStore';
import { FetchError } from 'ofetch';
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const viewPW = ref(false);
const errorMessage = ref("");

const userStore = useUserStore();
const router = useRouter();

// TODO: Move to shared file
interface User {
    username: string;
}

async function tryLogin() {
    try {
        const reply = await useAPI().fetch<{ token: string, user: User }>("/api/auth/login", { method: "POST", body: {
            username: username.value,
            password: password.value,
        } });
        userStore.login(reply.token, reply.user);
        router.push("/");
    } catch (e) {
        if (e instanceof FetchError) {
            const fe = e as FetchError;
            if (fe.statusCode === 401) {
                errorMessage.value = "Invalid credentials.";
                return;
            }
        }
        errorMessage.value = "There was an error trying to log in.";
    }
}
</script>

<style scoped>
.card {
    width: 450px;
}
</style>