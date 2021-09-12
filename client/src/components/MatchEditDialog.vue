<template>
    <el-dialog
        title="Edit match"
        :model-value="true"
        :before-close="closeBox">
        <el-row :gutter="10">
            <el-col :offset="5" :span="6">
                <span>{{ matchToEdit.player1 }}</span>
            </el-col>
            <el-col :span="2">
                vs
            </el-col>
            <el-col :span="4">
                <span>{{ matchToEdit.player2 }}</span>
            </el-col>
        </el-row>
        <br><br>
        <el-row>
            <el-col :offset="5" :span="6">
                <el-input-number v-model="matchToEdit.score1" controls-position="right" :min="0"></el-input-number>
            </el-col>
            <el-col :offset="2" :span="4">
                <el-input-number v-model="matchToEdit.score2" controls-position="right" :min="0"></el-input-number>
            </el-col>
        </el-row>
        <span class="dialog-footer">
            <el-button @click="saveMatch();" type="success" icon="el-icon-check" circle :loading="buttonLoading"></el-button>
        </span>
    </el-dialog>
</template>
<script lang="ts">
export default {
    name: 'MatchEditDialog',
    data() {
        return {
            buttonLoading: false,
            matchToEdit: {
                id: "",
                player1: "",
                player2: "",
                score1: 0,
                score2: 0
            }
        }
    },
    created() {
        this.matchToEdit = this.match;
    },
    methods: {
        saveMatch() {
            this.buttonLoading = true;
            this.$emit("matchEdited", {id: this.matchToEdit.id, player1: this.matchToEdit.player1, player2: this.matchToEdit.player2, score1: this.matchToEdit.score1, score2: this.matchToEdit.score2});
        },
        closeBox() {
            this.$emit("matchEdited");
        }
    },
    props: {
        match: Object
    },
    emits: ["matchEdited"]
}
</script>
