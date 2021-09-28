<template>
    <div class="tb-wrapper" :style="cssVars()">
        <BracketNode
          :bracket-node="recursiveBracket()"
          :highlighted-team-id="highlightedTeamId"
          @onMatchClick="onMatchClick"
          @onSelectTeam="onSelectTeam"
          @onDeselectTeam="onDeselectTeam" />
    </div>
</template>

<script lang="ts">
import BracketNode from "./bracket/BracketNode.vue"

export default {
    name: "TournamentBracket",
    components: {
        BracketNode
    },
    emits: [
        "onMatchClick"
    ],
    props: {
        rounds: Object,
        textColor: {
            type: String,
            default: "#ffffff"
        },
        titleColor: {
            type: String,
            default: "#9d999d"
        },
        teamBackgroundColor: {
            type: String,
            default: "#59595e"
        },
        highlightTeamBackgroundColor: {
            type: String,
            default: "#222222"
        },
        scoreBackgroundColor: {
            type: String,
            default: "#787a7f"
        },
        winnerScoreBackgroundColor: {
            type: String,
            default: "#ee7b3c"
        }
    },
    data() {
        return {
            highlightedTeamId: undefined
        }
    },
    methods: {
        onMatchClick(match) {
            this.$emit("onMatchClick", match);
        },
        onSelectTeam(team) {
            if(team != "") this.highlightedTeamId = team;
        },
        onDeselectTeam() {
            this.highlightedTeamId = undefined;
        },
        recursiveBracket() {
            if(!this.rounds) return undefined;

            let currentRound = [];
            let previousRound = [];
            let totalMatchCounter = 1;
            for(let i = 0; i < this.rounds.length; i++) {
                currentRound = this.rounds[i].matches.map((match) => {
                    if(!match.id) match.id = totalMatchCounter;
                    if(!match.title) match.title = `${totalMatchCounter}`;
                    totalMatchCounter++;
                    return {
                        match: match,
                        children: [],
                        hasParent: !!this.rounds[i+1]
                    }
                });

                if(previousRound.length == 0) {
                    previousRound = currentRound;
                    continue;
                }

                for(let j = 0; j < previousRound.length; j++) {
                    const matchForCurrentGame = Math.floor(j / 2);
                    currentRound[matchForCurrentGame].children.push(previousRound[j]);
                }

                previousRound = currentRound;
            }

            return currentRound[0] || undefined;
        },
        cssVars() {
            return {
                "--text-color": this.textColor,
                "--title-color": this.titleColor,
                "--team-background-color": this.teamBackgroundColor,
                "--highlight-team-background-color": this.highlightTeamBackgroundColor,
                "--score-background-color": this.scoreBackgroundColor,
                "--winner-score-background-color": this.winnerScoreBackgroundColor,
            };
        }
    }
}
</script>

<style>
.tb-wrapper {
  display: flex;
}
.tb-item-teams {
  color: var(--text-color);
}
.tb-item-teams .title {
  color: var(--title-color);
}
.tb-item-teams .tb-team {
  background-color: var(--team-background-color);
}
.tb-item-teams .tb-team .score {
  background-color: var(--score-background-color);
}
.tb-item-teams .tb-team.winner .score {
  background-color: var(--winner-score-background-color);
}
.tb-item-teams .tb-team.highlight {
  background-color: var(--highlight-team-background-color);
}
</style>