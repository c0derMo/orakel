import type { IGameReport } from "./IStageGame";

export interface ITournamentStage {
    tournamentId: string;
    stageNumber: number;
    name: string;
    stageType: string;
    stageConfig: Record<string, unknown>;
    enrollmentType: string;
    enrollmentConfig: Record<string, unknown>;
    participants: IStageParticipant[];
    reportedGames: IGameReport[];
}

export interface IStageParticipant {
    tournamentId: string;
    stageNumber: number;
    participantId: string;
    additionalInfo: Record<string, unknown>;
}
