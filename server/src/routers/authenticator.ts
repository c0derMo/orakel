import { Router }  from "express"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"
import { randomBytes } from "crypto";
import { UserModel, IUserDocument } from "../database/schemas/users";

export enum Permissions {
    NULL,
    ROOT,
    ADMINISTRATOR
}

const secretToken = process.env.TOKENSECRET || randomBytes(64).toString('hex');

const router = Router();

router.post("/login", async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let user = await UserModel.findOne({username: username});
    if(!user) {
        res.json({"authenticated": false});
        return;
    }
    let match = await bcrypt.compare(password, user.passwordHash);

    if(match) {
        let userObj = {
            "userId": user._id,
            "displayName": user.displayname,
            "permissions": convertPermissionsToObject(user.permissions)
        }
        let token = jwt.sign({
            userId: user._id
        },
        secretToken, {
            expiresIn: '7d'
        })
        res.json({"authenticated": true, "user": userObj, "token": token});
    } else {
        res.json({"authenticated": false});
    }
})

export default router;

// Auth utility functions

export function getUserIdFromToken(token: string): string {
    try {
        let user = jwt.verify(token, secretToken) as jwt.JwtPayload;
        return user.userId;
    } catch(err) {
        return undefined;
    }
}

export async function hasPermission(user: string | IUserDocument, permission: Permissions, rootOverridable: boolean = true) {
    if(typeof(user) == "string") {
        user = await UserModel.findById(user);
    }
    if(!user?.permissions) {
        return false;
    }
    if(user.permissions < 2 ** (Object.keys(Permissions).length)-1) {
        user.permissions = upgradePermissions(user.permissions);
    }

    let permissions = decodePermissions(user.permissions);

    if(rootOverridable && permissions[Permissions.ROOT]) return true;
    return permissions[permission];
}

export function decodePermissions(permissions: number): boolean[] {
    let result = Array(Object.keys(Permissions).length/2).fill(false);
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
    let decodedPerms = Array(permissionsSize+1).fill(false);
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
    if(permissions < 2 ** (Object.keys(Permissions).length)-1) {
        permissions = upgradePermissions(permissions);
    }

    let decodedPerms = decodePermissions(permissions);
    let result = {};

    Object.keys(Permissions).forEach(e => {
        if(isNaN(parseInt(e))) {
            result[e] = decodedPerms[Permissions[e]];
        }
    });

    return result;
}