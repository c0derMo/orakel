<template>
    <div class="w-full">
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
    </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAPI } from "../../../../composables/http";
import type { ITournament } from "@shared/interfaces/ITournament";
import type { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import { computed, ref, watch } from "vue";
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
const stage = ref(
    await useAPI().fetch<ITournamentStage>(
        `/api/tournament/${tournament.id}/stages/${params.stageNumber}`,
    ),
);
const placements = ref(
    await useAPI().fetch<string[]>(
        `/api/tournament/${tournament.id}/stages/${params.stageNumber}/placements`,
    ),
);
const stageTypes =
    await useAPI().fetch<Record<string, string>>(`/api/data/stageTypes`);
const enrollmentConfigs = await useAPI().fetch<Record<string, string>>(
    `/api/data/enrollmentConfigs`,
);

const emits = defineEmits<{
    setPageTitle: [title: string];
}>();

emits("setPageTitle", `Stage ${params.stageNumber} - ${stage.value.name}`);

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
    computedStageTypes.value.find((v) => v.value === stage.value.stageType)!,
);
const enrollmentConfig = ref(
    computedEnrollmentConfigs.value.find(
        (v) => v.value === stage.value.enrollmentType,
    )!,
);

async function save() {
    try {
        await useAPI().fetch(
            `/api/tournament/${tournament.id}/stages/${stage.value.stageNumber}`,
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

watch(
    () => (route.params as { stageNumber: string }).stageNumber,
    async () => {
        const params = route.params as {
            tournament: string;
            stageNumber: string;
        };
        stage.value = await useAPI().fetch<ITournamentStage>(
            `/api/tournament/${tournament.id}/stages/${params.stageNumber}`,
        );
        placements.value = await useAPI().fetch<string[]>(
            `/api/tournament/${tournament.id}/stages/${params.stageNumber}/placements`,
        );
        stageType.value = computedStageTypes.value.find(
            (v) => v.value === stage.value.stageType,
        )!;
        enrollmentConfig.value = computedEnrollmentConfigs.value.find(
            (v) => v.value === stage.value.enrollmentType,
        )!;
        emits(
            "setPageTitle",
            `Stage ${params.stageNumber} - ${stage.value.name}`,
        );
    },
);
</script>
