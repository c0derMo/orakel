import { Router }  from "express"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"
import { randomBytes } from "crypto";
import { UserModel, IUserDocument } from "../database/schemas/users";
import { TournamentModel } from "../database/schemas/tournament";
import {Types} from "mongoose";

interface LoginBody {
    username: string;
    password: string;
}

export enum Permissions {
    NULL,
    ROOT,
    ADMINISTRATOR
}

const secretToken = process.env.TOKENSECRET || randomBytes(64).toString('hex');

const router = Router();

router.post("/login", async (req, res) => {
    const username = (req.body as LoginBody).username;
    const password = (req.body as LoginBody).password;

    const user = await UserModel.findOne({username: username});
    if(!user) {
        res.json({"authenticated": false});
        return;
    }
    const match = await bcrypt.compare(password, user.passwordHash);

    if(match) {
        const userObj = {
            "userId": user._id as string,
            "username": user.username,
            "permissions": convertPermissionsToObject(user.permissions)
        }
        const token = jwt.sign({
            userId: user._id as string
        },
        secretToken, {
            expiresIn: '7d'
        })
        res.json({"authenticated": true, "user": userObj, "token": token});
    } else {
        res.json({"authenticated": false});
    }
});

router.get("/get/:user", async(req, res) => {
    const user = req.params.user;

    const userObj = await UserModel.findOne({username: user}).exec();
    if(!userObj) {
        res.json({"status": "not found"});
        return;
    }

    const uID = (userObj._id as Types.ObjectId).toString()
    const tournaments = await TournamentModel.find();

    const tourneys: string[] = [];
    tournaments.forEach((e) => {
        if(e.organizor === uID || e.admins.includes(uID)) tourneys.push(e.name);
    })

    let highestRank = "";
    if(await hasPermission(userObj, Permissions.ROOT, false)) {
        highestRank = "Root Administrator";
    } else if(await hasPermission(userObj, Permissions.ADMINISTRATOR, false)) {
        highestRank = "Administrator";
    }

    const token = getUserIdFromToken((req.headers.authorization).substring(7));
    let permissions = {};
    if(token) {
        if(await hasPermission(token, Permissions.ADMINISTRATOR)) {
            permissions = convertPermissionsToObject(userObj.permissions);
        }
    }

    res.json({
        "username": userObj.username,
        "joined": userObj.dateOfEntry,
        "adminOfTournaments": tourneys,
        "rank": highestRank,
        "permissions": permissions
    });
});

export default router;

// Auth utility functions

export function getUserIdFromToken(token: string): string {
    try {
        const user = jwt.verify(token, secretToken) as jwt.JwtPayload;
        return user.userId as string;
    } catch(err) {
        return undefined;
    }
}

export async function hasPermission(user: string | IUserDocument, permission: Permissions, rootOverridable = true) {
    if(typeof(user) === "string") {
        user = await UserModel.findById(user);
    }
    if(!user?.permissions) {
        return false;
    }
    if(user.permissions < 2 ** ((Object.keys(Permissions).length/2)-1)) {
        user.permissions = upgradePermissions(user.permissions);
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

function convertPermissionsToObject(permissions: number): object {
    if(permissions < 2 ** (Object.keys(Permissions).length/2)-1) {
        permissions = upgradePermissions(permissions);
    }

    const decodedPerms = decodePermissions(permissions).reverse();
    const result = {};

    Object.keys(Permissions).forEach(e => {
        if(isNaN(parseInt(e))) {
            result[e] = decodedPerms[Permissions[e] as number];
        }
    });

    return result;
}
