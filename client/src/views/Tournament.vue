<template>
    <div>
        <h1>{{ this.$route.params.tid }}</h1>
        <el-divider></el-divider>
        <MatchEditDialog v-if="editDialogVisible" :match="matchToEdit" @matchEdited="matchEdited" />
        <TournamentBracket :rounds="rounds" @onMatchClick="onMatchSelect" />
    </div>
</template>

<script>
import MatchEditDialog from "../components/MatchEditDialog.vue"
import TournamentBracket from "../components/TournamentBracket.vue"
import http from "../http";

export default {
    name: 'Tournament',
    components: {
        TournamentBracket,
        MatchEditDialog
    },
    data() {
        return {
            rounds: [],
            editDialogVisible: false,
            matchToEdit: {
                id: "",
                player1: "",
                player2: "",
                score1: 0,
                score2: 0
            },
            tournamentMetaData: {
                "organizor": {
                    "id": ""
                }
            }
        }
    },
    async created() {
        await this.updateTournament();
        this.$watch(() => this.$route.params.tid, async () => {
            await this.updateTournament();
        });
    },
    methods: {
        async updateTournament() {
            await this.updateBracket();
            let response = await http.get("/api/tournaments/get/" + this.$route.params.tid + "/metadata");
            if(response.data.status == "ok") this.tournamentMetaData = response.data;
        },
        async updateBracket() {
            let response = await http.get("/api/tournaments/get/" + this.$route.params.tid);
            this.rounds = response.data.rounds;
        },
        onMatchSelect(val) {
            console.log(val);

            if(!this.$store.getters.isLoggedIn) return;
            if(this.tournamentMetaData.organizor.id !== this.$store.getters.getUser.userId &&
                !this.$store.getters.getUser.permissions["ROOT"] &&
                !this.$store.getters.getUser.permissions["ADMINISTRATOR"]) return;

            let match = undefined;
            this.rounds.forEach(element => {
                let tmp = element.matches.find((e) => e.id == val);
                if(tmp) match = tmp;
            });
            this.matchToEdit.id = val;
            this.matchToEdit.player1 = match.team1.name;
            this.matchToEdit.player2 = match.team2.name;
            this.matchToEdit.score1 = match.team1.score;
            this.matchToEdit.score2 = match.team2.score;
            
            this.editDialogVisible = true;
        },
        async matchEdited(match) {
            if(match) {
                console.log(match);

                let data = {
                score1: match.score1,
                score2: match.score2
                }

                let response = await http.patch("/api/tournaments/get/" + this.$route.params.tid + "/updateMatch/" + match.id, data);
                if(response.data.status == "unauthorized") {
                    this.$notify.error({
                        title: 'Unauthorized',
                        message: "You're not authorized to edit this match.",
                    });
                }
                await this.updateBracket();
            }
            
            this.editDialogVisible = false;
        }
    }
}
</script>