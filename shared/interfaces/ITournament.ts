import type { ITournamentStage } from "./ITournamentStage";
import type { IPublicUser } from "./IUser";

export interface ITournament {
    id: string;
    urlName: string;
    owningUser: IPublicUser;
    name: string;
    private: boolean;
    stages: ITournamentStage[];
    participants: ITournamentParticipant[];
}

export interface ITournamentParticipant {
    tournamentId: string;
    participantId: string;
    username: string;
    userId?: string;
    additionalInfo: Record<string, unknown>;
}

export interface IAccessPermission {
    tournamentId: string;
    userId: string;
    permissions: TournamentPermission[]
}

export enum TournamentPermission {
    ADMIN
}