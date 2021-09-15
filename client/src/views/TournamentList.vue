<template>
    <div>
        <el-table :data="matchList">
            <el-table-column prop="name" label="Name"></el-table-column>
            <el-table-column>
                <template #default="scope">
                    <el-button size="mini" @click="clickMatch(scope.row.name)">View</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import http from "../http.js"

export default {
    nane: "TournamentList",
    data() {
        return {
            matchList: []
        }
    },
    async created() {
        const response = await http.get("/api/tournaments/list");
        this.matchList = response.data;
    },
    methods: {
        clickMatch(name) {
            this.$router.push("/tournament/" + name);
        }
    }
}
</script>