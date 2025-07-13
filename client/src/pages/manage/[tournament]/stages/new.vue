<template>
    <q-card class="w-full">
        <q-card-section class="column q-gutter-sm q-ma-sm">
            <h5>Add stage to tournament</h5>

            <q-input v-model="stageName" label="Stage name" />
            <q-input v-model="stageNumber" label="Stage number" type="number" />
            <q-select
                v-model="stageType"
                label="Stage Type"
                :options="computedStageTypes"
            />

            <!-- STAGE OPTIONS -->

            <q-select
                v-model="enrollmentConfig"
                label="Enrollment Config"
                :options="computedEnrollmentConfigs"
            />

            <!-- ENROLLMENT CONFIG OPTIONS (& add more enrollment configs) -->

            <q-btn color="green" @click="addStage">Create</q-btn>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { useAPI } from "../../../../composables/http";
import { useRoute, useRouter } from "vue-router";
import type { ITournament } from "@shared/interfaces/ITournament";
import { ref, computed } from "vue";
import { Notify } from "quasar";
import { FetchError } from "ofetch";

const route = useRoute();

const emits = defineEmits<{
    setPageTitle: [title: string];
}>();

emits("setPageTitle", "New Stage");

const tournament = await useAPI().fetch<ITournament>(
    `/api/tournament/${(route.params as { tournament: string }).tournament}`,
);
const stageTypes =
    await useAPI().fetch<Record<string, string>>(`/api/data/stageTypes`);
const enrollmentConfigs = await useAPI().fetch<Record<string, string>>(
    `/api/data/enrollmentConfigs`,
);

const stageName = ref("");
const stageNumber = ref("");
const stageType = ref({ value: "", label: "" });
const enrollmentConfig = ref({ value: "", label: "" });

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

async function addStage() {
    try {
        await useAPI().fetch(`/api/tournament/${tournament.id}/stages`, {
            method: "PUT",
            body: {
                stageNumber: parseInt(stageNumber.value),
                name: stageName.value,
                stageType: stageType.value.value,
                enrollmentType: enrollmentConfig.value.value,
            },
        });
        await useRouter().push(
            `/manage/${tournament.urlName}/stages/${stageNumber.value}`,
        );
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
