<template>
  <v-dialog persistent v-model="visible">
    <v-card>
      <v-card-title>Edit match</v-card-title>
      <v-container>
        <v-row>
          <v-col>{{ matchToEdit.player1 }}</v-col>
          <v-col>vs</v-col>
          <v-col>{{ matchToEdit.player2 }}</v-col>
        </v-row>
        <v-row class="mt-5">
          <v-col>
            <input type="number" v-model="matchToEdit.score1" />
          </v-col>
          <v-col></v-col>
          <v-col>
            <input type="number" v-model="matchToEdit.score2" />
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions>
        <v-btn @click="saveMatch" type="success" icon="mdi-check-bold"></v-btn>
        <v-btn @click="closeBox" icon="mdi-close"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  name: "MatchEditDialog",
  data() {
    return {
      buttonLoading: false,
      matchToEdit: {
        id: "",
        player1: "",
        player2: "",
        score1: 0,
        score2: 0,
      },
      visible: true,
    };
  },
  created() {
    this.matchToEdit = this.match;
  },
  methods: {
    saveMatch() {
      this.buttonLoading = true;
      this.$emit("matchEdited", {
        id: this.matchToEdit.id,
        player1: this.matchToEdit.player1,
        player2: this.matchToEdit.player2,
        score1: this.matchToEdit.score1,
        score2: this.matchToEdit.score2,
      });
    },
    closeBox() {
      this.$emit("matchEdited");
    },
  },
  props: {
    match: Object,
  },
  emits: ["matchEdited"],
};
</script>
