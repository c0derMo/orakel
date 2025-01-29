import { IGameReport } from "./IStageGame";

export interface ITournamentStage {
    tournamentId: string;
    stageNumber: number;
    name: string;
    type: string;
    enrollmentConfig: IStageEnrollmentConfig;
    participants: IStageParticipant[];
    reportedGames: IGameReport[];
}

export interface IStageEnrollmentConfig {
    enrollmentType: string;
    [key: string]: unknown;
}

export interface IStageParticipant {
    tournamentId: string;
    stageNumber: number;
    participantId: string;
    additionalInfo: Record<string, unknown>;
}