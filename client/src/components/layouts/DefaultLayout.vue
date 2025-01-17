<template>
    <q-layout view="hHh lpR fFf">
        <q-header reveal elevated class="bg-primary text-white">
            <q-toolbar>
                <span
                    class="text-h6 q-mx-sm cursor-pointer"
                    @click="router.push('/')"
                >
                    Orakel
                </span>
                <q-btn stretch flat @click="router.push('/tournaments/browse')">
                    Browse
                </q-btn>

                <q-space />
                <q-separator vertical inset />

                <UserHeader />
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="flex flex-column justify-center items-start">
                <slot />
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>
