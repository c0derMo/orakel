<template>
    <ManageLayout :tournament="tournament" :title="pageTitle">
        <q-card class="w-full">
            <q-card-section class="column q-gutter-sm q-ma-sm">
                <q-select
                    v-model="stageType"
                    label="Stage Type"
                    :options="computedStageTypes"
                />

                <q-select
                    v-model="enrollmentConfig"
                    label="Enrollment Config"
                    :options="computedEnrollmentConfigs"
                />

                <q-btn color="green" @click="save">Save</q-btn>
            </q-card-section>
        </q-card>

        <q-card class="w-full q-mt-md">
            <q-card-section>
                <div v-for="(placement, idx) of placements" :key="idx">
                    {{ placement }}
                </div>
            </q-card-section>
        </q-card>
    </ManageLayout>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAPI } from "../../../../composables/http";
import type { ITournament } from "@shared/interfaces/ITournament";
import type { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import { computed, ref } from "vue";
import { FetchError } from "ofetch";
import { Notify } from "quasar";

const route = useRoute();
const params = route.params as {
    tournament: string;
    stageNumber: string;
};

const tournament = await useAPI().fetch<ITournament>(
    `/api/tournament/${params.tournament}`,
);
const stage = await useAPI().fetch<ITournamentStage>(
    `/api/tournament/${tournament.id}/stages/${params.stageNumber}`,
);
const placements = await useAPI().fetch<string[]>(
    `/api/tournament/${tournament.id}/stages/${params.stageNumber}/placements`,
);
const stageTypes =
    await useAPI().fetch<Record<string, string>>(`/api/data/stageTypes`);
const enrollmentConfigs = await useAPI().fetch<Record<string, string>>(
    `/api/data/enrollmentConfigs`,
);

const pageTitle = `Stage ${params.stageNumber} - ${stage.name}`;

const computedStageTypes = computed(() => {
    const result = [];
    for (const key in stageTypes) {
        result.push({
            value: key,
            label: stageTypes[key],
        });
    }
    return result;
});

const computedEnrollmentConfigs = computed(() => {
    const result = [];
    for (const key in enrollmentConfigs) {
        result.push({
            value: key,
            label: enrollmentConfigs[key],
        });
    }
    return result;
});

const stageType = ref(
    computedStageTypes.value.find((v) => v.value === stage.stageType)!,
);
const enrollmentConfig = ref(
    computedEnrollmentConfigs.value.find(
        (v) => v.value === stage.enrollmentType,
    )!,
);

async function save() {
    try {
        await useAPI().fetch(
            `/api/tournament/${tournament.id}/stages/${stage.stageNumber}`,
            {
                method: "PATCH",
                body: {
                    stageType: stageType.value.value,
                    enrollmentType: enrollmentConfig.value.value,
                },
            },
        );
        Notify.create({
            type: "positive",
            message: "Saved successfully.",
        });
    } catch (e) {
        if (e instanceof FetchError) {
            Notify.create({
                type: "negative",
                message: e.message,
            });
        }
    }
}
</script>
