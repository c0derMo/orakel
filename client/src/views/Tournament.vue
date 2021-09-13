<template>
    <div>
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

            }
        }
    },
    async created() {
        await this.updateBracket();
        this.$watch(() => this.$route.params.tid, async () => {
            await this.updateBracket();
        });
    },
    methods: {
        async updateBracket() {
            let response = await http.get("/api/tournaments/" + this.$route.params.tid);
            this.rounds = response.data.rounds;
        },
        onMatchSelect(val) {
            console.log(val);
            let match = undefined;
            this.rounds.forEach(element => {
                let tmp = element.matchs.find((e) => e.id == val);
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

                let response = await http.patch("/api/tournaments/" + this.$route.params.tid + "/updateMatch/" + match.id, data);
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