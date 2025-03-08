import { defineStore } from "pinia";
import { useAPI } from "./http";
import type { ITournamentParticipant } from "@shared/interfaces/ITournament";

export const useParticipantNames = defineStore("participantNames", {
    state: () => ({
        names: {} as Record<string, Record<string, string>>,
    }),
    getters: {
        getParticipantName: (state) => {
            return (tournament: string, user: string) =>
                state.names[tournament]?.[user] ?? `unknown: ${user}`;
        },
    },
    actions: {
        async loadTournament(tournament: string) {
            const queriedParticipants = await useAPI().fetch<
                ITournamentParticipant[]
            >(`/api/tournament/${tournament}/participants`);
            this.names[tournament] = {};
            for (const participant of queriedParticipants) {
                this.names[tournament][participant.participantId] =
                    participant.username;
            }
        },
    },
    persist: false,
});
