import {hasPermission, Permissions} from "../lib/auth";

interface IUser {
    id: string;
    username: string;
    passwordHash: string;
    permissions: number;
    registrationDate?: Date;
    lastUpdated?: Date;
}

export abstract class User {
    readonly id: string;
    username: string;
    passwordHash: string;
    permissions: number;
    registrationDate?: Date;
    lastUpdated?: Date;

    constructor(info: IUser) {
        this.id = info.id;
        this.username = info.username;
        this.passwordHash = info.passwordHash;
        this.permissions = info.permissions;
        this.registrationDate = info.registrationDate;
        this.lastUpdated = info.lastUpdated;
    }

    abstract save();

    async getTitle(): Promise<string> {
        if (await hasPermission(this.id, Permissions.ROOT)) return "Root Administrator";
        if (await hasPermission(this.id, Permissions.ADMINISTRATOR)) return "Site Adminstrator";
        return "";
    }
}
