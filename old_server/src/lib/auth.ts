import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken"
import {randomBytes} from "crypto";
import {getDatabase} from "../database/databaseConnector";

const secretToken = process.env.TOKENSECRET || randomBytes(64).toString('hex');

//region Interfaces & Enums
export enum Permissions {
    NULL,
    ROOT,
    ADMINISTRATOR
}

export interface IPermissionsObject {
    [permission: string]: boolean
}

export interface IAuthorizationResult {
    authenticated: boolean,
    user?: {
        userId: string,
        username: string,
        permissions: IPermissionsObject
    },
    token?: string
}
//endregion

export async function tryLogin(username: string, password: string): Promise<IAuthorizationResult> {
    const user = await getDatabase().getUserByName(username);
    if (!user) {
        return {authenticated: false}
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (match) {
        const userObj = {
            userId: user.id,
            username: user.username,
            permissions: convertPermissionsToObject(user.permissions)
        };
        const token = jwt.sign({
            userId: user.id
        }, secretToken, { expiresIn: '7d' });
        return {authenticated: true, user: userObj, token: token}
    }
    return {authenticated: false}
}

export function getUserIdFromToken(token: string): string {
    try {
        const user = jwt.verify(token, secretToken) as jwt.JwtPayload;
        return user.userId as string;
    } catch {
        return undefined;
    }
}

export async function hasPermission(userId: string, permission: Permissions, rootOverridable = true): Promise<boolean> {
    const user = await getDatabase().getUserById(userId);
    if(!user?.permissions) {
        return false;
    }
    if (needsUpgrade(user.permissions)) {
        user.permissions = upgradePermissions(user.permissions);
        await user.save();
    }

    const permissions = decodePermissions(user.permissions);

    if(rootOverridable && permissions[Permissions.ROOT]) {
        return true;
    }
    return permissions[permission];
}

export function decodePermissions(permissions: number): boolean[] {
    const result: boolean[] = Array(Object.keys(Permissions).length/2).fill(false) as boolean[];
    for(let i=(Object.keys(Permissions).length/2)-1; i>=0; i--) {
        if(permissions >= (2 ** i)) {
            permissions = permissions - (2 ** i);
            result[i] = true;
        }
    }

    return result.reverse();
}

export function encodePermissions(permissions: boolean[]): number {
    let result = 0;
    permissions.reverse().forEach((e, idx) => {
        if(e) {
            result += 2 ** idx;
        }
    });
    return result;
}

function upgradePermissions(permissions: number): number {
    // Checking whether permissions upgrade is necessary
    if(permissions >= 2 ** (Object.keys(Permissions).length/2)-1) {
        return permissions;
    }

    // Figuring out old permissions size
    let permissionsSize = (Object.keys(Permissions).length/2)-1;
    while(permissions < 2 ** permissionsSize) {
        permissionsSize--;
    }

    // Decoding old permissions
    const decodedPerms: boolean[] = Array(permissionsSize+1).fill(false) as boolean[];
    for(let i=permissionsSize; i>=0; i--) {
        if(permissions >= (2 ** i)) {
            permissions = permissions - (2 ** i);
            decodedPerms[i] = true;
        }
    }

    // Filling up decoded permissions to get them to the new standard
    while(decodedPerms.length < Object.keys(Permissions).length/2) {
        decodedPerms.push(false);
    }

    // Reencoding permissions
    permissions = encodePermissions(decodedPerms);

    return permissions
}

function needsUpgrade(permissions: number): boolean {
    return permissions < 2 ** (Object.keys(Permissions).length / 2) - 1;

}

export function convertPermissionsToObject(permissions: number): IPermissionsObject {
    permissions = upgradePermissions(permissions);

    const decodedPerms = decodePermissions(permissions).reverse();
    const result = {};

    Object.keys(Permissions).forEach(e => {
        if(isNaN(parseInt(e))) {
            result[e] = decodedPerms[Permissions[e] as number];
        }
    });

    return result;
}
