<template>
  <v-row>
    <v-col offset="2" md="8">
      <v-list>
        <v-list-item
          v-for="tournament in tournamentList"
          :key="tournament._id"
          two-line
        >
          <v-list-item-content>
            <v-list-item-title>
              {{ tournament.name }}
              <v-chip color="red" text-color="white" v-if="tournament.private"
                >Private</v-chip
              >
            </v-list-item-title>
            <v-list-item-subtitle
              >Organizor: {{ tournament.organizor }}</v-list-item-subtitle
            >
          </v-list-item-content>
          <v-spacer></v-spacer>
          <v-list-item-action>
            <v-btn text @click="clickTournament(tournament.name)">View</v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
import http from "../http";

export default {
  nane: "TournamentList",
  data() {
    return {
      tournamentList: [],
    };
  },
  async created() {
    const response = await http.get("/api/tournaments/list");
    this.tournamentList = response.data;
  },
  methods: {
    clickTournament(name) {
      this.$router.push("/tournament/" + name);
    },
  },
};
</script>
