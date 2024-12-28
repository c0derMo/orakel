<template>
  <div class="tb-item-teams">
    <div>
      <div class="title">
        <span>{{ bracketNode.match.title }}</span>
      </div>
      <div
        :class="[
          'tb-team',
          'tb-team-top',
          getPlayerClass(bracketNode.match.team1.id),
        ]"
        @mouseover="highlightTeam(bracketNode.match.team1.id)"
        @mouseleave="unhighlightTeam"
        @click="onClick"
      >
        <span class="name">{{ bracketNode.match.team1.name }}</span>
        <span class="score">{{ bracketNode.match.team1.score }}</span>
      </div>

      <div
        :class="[
          'tb-team',
          'tb-team-bot',
          getPlayerClass(bracketNode.match.team2.id),
        ]"
        @mouseover="highlightTeam(bracketNode.match.team2.id)"
        @mouseleave="unhighlightTeam"
        @click="onClick"
      >
        <span class="name">{{ bracketNode.match.team2.name }}</span>
        <span class="score">{{ bracketNode.match.team2.score }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BracketMatch",
  props: {
    bracketNode: Object,
    highlightedTeamId: String,
  },
  emits: ["onMatchClick", "onSelectTeam", "onDeselectTeam"],
  methods: {
    getPlayerClass(teamId) {
      let cl = "";
      if (
        this.bracketNode.match.winner !== undefined &&
        this.bracketNode.match.winner == teamId
      ) {
        cl += " winner";
      }
      if (this.highlightedTeamId == teamId) {
        cl += " highlight";
      }
      return cl;
    },
    onClick() {
      this.$emit("onMatchClick", this.bracketNode.match.id);
    },
    highlightTeam(tId) {
      this.$emit("onSelectTeam", tId);
    },
    unhighlightTeam() {
      this.$emit("onDeselectTeam");
    },
  },
};
</script>
