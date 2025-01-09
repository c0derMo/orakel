<template>
    <DefaultLayout>
        <div style="width: 100%; padding-left: 50px; padding-right: 50px">
            <q-table
                title="Tournaments"
                row-key="id"
                :rows="tournaments"
                :columns="columnDefinition"
                :visible-columns="visibleColumns"
            />
        </div>
    </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAPI } from "../../composables/http";

const columnDefinition = [
    { name: "id", label: "UUID", field: "id" },
    { name: "title", label: "Name", field: "name" },
    { name: "owner", label: "Owner", field: "owningUser" },
    { name: "link", label: "", field: "urlName" },
];
const visibleColumns = ["title", "owner", "link"];

const tournaments = ref<ITournament[]>([]);

onMounted(async () => {
    // TODO: Server side pagination
    tournaments.value = await useAPI().fetch<ITournament[]>("/api/tournament");
});
</script>
