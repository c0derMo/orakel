export interface IStageGame {
    tournamentId: string;
    stageNumber: number;
    matchNumber: number;
    groupNumber?: number;
    participantIds: (string | null)[];
    precessorGames: number[];
    templateParticipantNames: string[];
    participants: number;
    result?: IGameReport;
}

export interface IStageGameGroup {
    tournamentId: string;
    stageNumber: number;
    groupNumber: number;
    title: string;
}

export interface IGameReport {
    tournamentId: string;
    stageNumber: number;
    matchNumber: number;
    scores: number[];
}