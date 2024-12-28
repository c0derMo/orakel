import type { IPublicUser } from "./IUser";

export interface ITournament {
    id: string;
    urlName: string;
    owningUser: IPublicUser;
    name: string;
    private: boolean;
    brackets: IBracket[];
}

export interface IBracket {
    tournamentId: string;
    name: string;
    type: string;
}

export interface IAccessPermission {
    tournamentId: string;
    userId: string;
    permissions: TournamentPermission[]
}

export enum TournamentPermission {
    ADMIN
}