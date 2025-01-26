<template>
    <q-layout view="hHh lpR fFf">
        <q-header elevated class="bg-primary text-white">
            <q-toolbar>
                <q-btn
                    dense
                    flat
                    round
                    icon="arrow_back"
                    @click="router.push(`/tournaments/${tournament.urlName}`)"
                />
                <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

                <q-toolbar-title shrink>
                    Manage: {{ tournament.name }}
                    <span v-if="title != null"> - {{ title }}</span>
                </q-toolbar-title>

                <q-space />
                <q-separator vertical inset />

                <UserHeader />
            </q-toolbar>
        </q-header>

        <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
            <q-list>
                <q-item
                    v-ripple
                    clickable
                    @click="router.push(`/manage/${tournament.urlName}/`)"
                >
                    <q-item-section avatar>
                        <q-icon name="list" />
                    </q-item-section>
                    <q-item-section> General information </q-item-section>
                </q-item>
                <q-item
                    v-ripple
                    clickable
                    @click="
                        router.push(
                            `/manage/${tournament.urlName}/participants`,
                        )
                    "
                >
                    <q-item-section avatar>
                        <q-icon name="people" />
                    </q-item-section>
                    <q-item-section> Participants </q-item-section>
                </q-item>

                <q-separator />
                <q-item-label header>Stages</q-item-label>

                <q-item
                    v-for="stage in stages"
                    :key="stage.stageNumber"
                    v-ripple
                    clickable
                >
                    <q-item-section avatar>
                        {{ stage.stageNumber }}
                    </q-item-section>

                    <q-item-section>{{ stage.name }}</q-item-section>
                </q-item>

                <q-item
                    v-ripple
                    clickable
                    @click="
                        router.push(`/manage/${tournament.urlName}/stages/new`)
                    "
                >
                    <q-item-section avatar>
                        <q-icon name="add" />
                    </q-item-section>
                    <q-item-section> Add new stage </q-item-section>
                </q-item>
            </q-list>
        </q-drawer>

        <q-page-container>
            <q-page class="page-padding q-pt-md">
                <div class="flex flex-column justify-center items-start">
                    <slot />
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { ITournament } from "@shared/interfaces/ITournament";
import { Platform } from "quasar";
import { useAPI } from "../../composables/http";
import type { ITournamentStage } from "@shared/interfaces/ITournamentStage";

const router = useRouter();
const props = defineProps<{
    tournament: ITournament;
    title?: string;
}>();

const leftDrawerOpen = ref(!Platform.is.mobile);
const stages = await useAPI().fetch<ITournamentStage[]>(
    `/api/tournament/${props.tournament.id}/stages`,
);

function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style scoped>
.desktop .page-padding {
    margin-left: 350px;
    margin-right: 350px;
}
</style>
