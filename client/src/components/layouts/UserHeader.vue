<template>
    <div class="q-ml-sm">
        <span v-if="userStore.isLoggedIn">
            Welcome, {{ userStore.user?.username }}
        </span>
        <q-btn v-else stretch flat icon="login" @click="router.push('/login')">
            Login
        </q-btn>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "../../composables/userStore";

const router = useRouter();
const userStore = useUserStore();
</script>
