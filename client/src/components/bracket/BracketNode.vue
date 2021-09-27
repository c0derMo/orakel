<template>
    <div class="tb-item" v-if="matchesArePresent()">
        <div :class="getGameMatchClass(bracketNode)">
            <BracketMatch
                :bracket-node="bracketNode"
                :highlighted-team-id="highlightedTeamId"
                @onMatchClick="onMatchClick"
                @onSelectTeam="onSelectTeam"
                @onDeselectTeam="onDeselectTeam" />
        </div>

        <div v-if="bracketNode.children[0] || bracketNode.children[1]" class="tb-item-children">
            <div class="tb-item-child" v-if="bracketNode.children[0]">
                <BracketNode
                    :bracket-node="bracketNode.children[0]"
                    :highlighted-team-id="highlightedTeamId"
                    @onMatchClick="onMatchClick"
                    @onSelectTeam="onSelectTeam"
                    @onDeselectTeam="onDeselectTeam" />
            </div>
            <div class="tb-item-child" v-if="bracketNode.children[1]">
                <BracketNode
                    :bracket-node="bracketNode.children[1]"
                    :highlighted-team-id="highlightedTeamId"
                    @onMatchClick="onMatchClick"
                    @onSelectTeam="onSelectTeam"
                    @onDeselectTeam="onDeselectTeam" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import BracketMatch from "./BracketMatch.vue"

export default {
    name: "BracketNode",
    components: {
        BracketMatch
    },
    emits: [
        "onMatchClick",
        "onSelectTeam",
        "onDeselectTeam"
    ],
    props: {
        bracketNode: {
            type: Object,
            default() {
                return {
                    children: [],
                    match: undefined,
                    hasParent: undefined
                }
            }
        },
        highlightedTeamId: String
    },
    methods: {
        matchesArePresent() {
            return this.bracketNode.match !== undefined;
        },
        getGameMatchClass(node) {
            if(node.children[0] || node.children[1]) {
                return "tb-item-parent";
            }
            if(node.hasParent) return "tb-item-child";
            return "";
        },
        onMatchClick(matchId) {
            this.$emit("onMatchClick", matchId);
        },
        onSelectTeam(team) {
            this.$emit("onSelectTeam", team);
        },
        onDeselectTeam() {
            this.$emit("onDeselectTeam");
        }
    }
}
</script>

<style>
.tb-item {
  display: flex;
  flex-direction: row-reverse;
}
.tb-item-parent {
  position: relative;
  margin-left: 50px;
  display: flex;
  align-items: center;
}
.tb-item-teams {
  flex-direction: column;
  margin-bottom: 16px;
}
.tb-item-teams .title {
  font-size: 8px;
  text-align: left;
}
.tb-item-teams .tb-team {
  display: flex;
  font-size: 10px;
  width: 140px;
}
.tb-item-teams .tb-team .name {
  padding: 3px 6px;
  font-size: 10px;
  width: 110px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tb-item-teams .tb-team .score {
  margin-left: auto;
  padding: 3px;
  font-size: 12px;
  width: 20px;
  text-align: center;
}
.tb-item-teams .tb-team-top .score {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
.tb-item-teams .tb-team-bot .score {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
.tb-item-teams .tb-team-top {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom: 2px solid #414146;
}
.tb-item-teams .tb-team-bot {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
.tb-item-parent:after {
  position: absolute;
  content: "";
  width: 25px;
  height: 2px;
  left: 0;
  top: 50%;
  background-color: gray;
  transform: translateX(-100%);
}
.tb-item-children {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.tb-item-child {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: 10px;
  margin-bottom: 10px;
  position: relative;
}
.tb-item-child:before {
  content: "";
  position: absolute;
  background-color: gray;
  right: 0;
  top: 50%;
  transform: translateX(100%);
  width: 25px;
  height: 2px;
}
.tb-item-child:after {
  content: "";
  position: absolute;
  background-color: gray;
  right: -25px;
  height: calc(50% + 22px);
  width: 2px;
  top: 50%;
}
.tb-item-child:last-child:after {
  transform: translateY(-100%);
}
.tb-item-child:only-child:after {
  display: none;
}
</style>