<template>
    <q-layout view="hHh lpR fFf">
        <q-header reveal elevated class="bg-primary text-white">
            <q-toolbar>
                <q-btn
                    dense
                    flat
                    round
                    icon="arrow_back"
                    @click="router.push('/')"
                />
                <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

                <q-toolbar-title>
                    Manage: {{ tournament.name }}
                </q-toolbar-title>

                <q-space />
                <q-separator vertical inset />

                <UserHeader />
            </q-toolbar>
        </q-header>

        <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
            <q-list>
                <q-item v-ripple clickable>
                    <q-item-section avatar>
                        <q-icon name="list" />
                    </q-item-section>
                    <q-item-section> General information </q-item-section>
                </q-item>
                <q-item v-ripple clickable>
                    <q-item-section avatar>
                        <q-icon name="people" />
                    </q-item-section>
                    <q-item-section> Participants </q-item-section>
                </q-item>

                <q-seperator />
                <q-item-label header>Stages</q-item-label>

                <q-item v-ripple clickable>
                    <q-item-section avatar>
                        <q-icon name="add" />
                    </q-item-section>
                    <q-item-section> Add new stage </q-item-section>
                </q-item>
            </q-list>
        </q-drawer>

        <q-page-container>
            <q-page class="flex flex-column justify-center items-start">
                <slot />
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { ITournament } from "@shared/interfaces/ITournament";

const router = useRouter();
defineProps<{
    tournament: ITournament;
}>();

const leftDrawerOpen = ref(true);

function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
