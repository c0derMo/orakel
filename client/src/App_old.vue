<template>
  <div>
    <MatchEditDialog v-if="editDialogVisible" :match="matchToEdit" @matchEdited="matchEdited" />
    <TournamentBracket :rounds="rounds" @onMatchClick="onMatchSelect" />
    <LoginDialog />
  </div>
</template>

<script>
import MatchEditDialog from "./components/MatchEditDialog.vue"
import TournamentBracket from './components/TournamentBracket.vue';
import LoginDialog from './components/LoginDialog.vue'
import http from './http-common';

export default {
  name: 'App',
  components: {
    TournamentBracket,
    MatchEditDialog,
    LoginDialog
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
      }
    }
  },
  async created() {
    await this.updateBracket()
  },
  methods: {
    async updateBracket() {
      let response = await http.get("/tournament/FirstTestTournament");
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

        await http.patch("/tournament/FirstTestTournament/updateMatch/" + match.id, data);
        await this.updateBracket();
      }
      
      this.editDialogVisible = false;
    }
  }
}
</script>