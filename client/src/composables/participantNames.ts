import { defineStore } from "pinia";
import { useAPI } from "./http";
import type { ITournamentParticipant } from "@shared/interfaces/ITournament";
import type { IStageParticipant } from "@shared/interfaces/ITournamentStage";

export const useParticipantNames = defineStore("participantNames", {
    state: () => ({
        tournamentParticipantNames: new Map<string, Map<string, string>>(),
        stageParticipantNames: new Map<
            string,
            Map<number, Map<string, string>>
        >(),
    }),
    getters: {
        getParticipantName: (state) => {
            return (
                tournament: string,
                user: string,
                stage: number | null = null,
            ): string => {
                if (stage != null) {
                    const stageNames = state.stageParticipantNames
                        .get(tournament)
                        ?.get(stage);
                    if (stageNames?.has(user)) {
                        return stageNames.get(user)!;
                    }
                }
                return (
                    state.tournamentParticipantNames
                        .get(tournament)
                        ?.get(user) ?? `unknown ${user}`
                );
            };
        },
        isParticipantKnown: (state) => {
            return (tournament: string, user: string): boolean => {
                return (
                    state.tournamentParticipantNames
                        .get(tournament)
                        ?.has(user) ?? false
                );
            };
        },
    },
    actions: {
        async loadTournament(tournament: string) {
            const queriedParticipants = await useAPI().fetch<
                ITournamentParticipant[]
            >(`/api/tournament/${tournament}/participants`);
            const resultMap = new Map<string, string>();
            for (const participant of queriedParticipants) {
                resultMap.set(participant.participantId, participant.username);
            }
            this.tournamentParticipantNames.set(tournament, resultMap);
        },
        async loadStage(tournament: string, stage: number) {
            const queriedParticipants = await useAPI().fetch<
                IStageParticipant[]
            >(`/api/tournament/${tournament}/stages/${stage}/participants`);
            const resultMap = new Map<string, string>();
            for (const participant of queriedParticipants) {
                if (participant.dummyName != null) {
                    resultMap.set(
                        participant.participantId,
                        participant.dummyName,
                    );
                }
            }
            if (!this.stageParticipantNames.has(tournament)) {
                this.stageParticipantNames.set(tournament, new Map());
            }
            this.stageParticipantNames.get(tournament)!.set(stage, resultMap);
        },
    },
    persist: false,
});
