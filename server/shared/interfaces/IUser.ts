import type { IAccessPermission, ITournament } from "./ITournament";

/**
 * Basic User to be transmitted and used in frontend
 */
export interface IPublicUser {
    id: string;
    username: string;
    registrationDate: Date;
}

/**
 * Extended user with information users can aquire about themselves
 */
export interface IExtendedUser extends IPublicUser {
    permissions: IUserPermissions[];
    accessibleTournaments: IAccessPermission[];
    owningTournaments: Partial<ITournament>[];
}

/**
 * Full User Info to be stored in database
 */
export interface IFullUser extends IExtendedUser {
    passwordHash: string;
    lastUpdated: Date;
}

export enum IUserPermissions {
    ROOT,
    ADMINISTRATOR,
}
