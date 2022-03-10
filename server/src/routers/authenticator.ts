import { Router }  from "express"
import { UserModel } from "../database/schemas/users";
import { TournamentModel } from "../database/schemas/tournament";
import { Types } from "mongoose";
import { tryLogin, getUserIdFromToken, Permissions, hasPermission, convertPermissionsToObject } from "../lib/auth";

interface LoginBody {
    username: string;
    password: string;
}

const router = Router();

router.post("/login", async (req, res) => {
    const username = (req.body as LoginBody).username;
    const password = (req.body as LoginBody).password;

    res.json(await tryLogin(username, password));
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

    const highestRank = userObj.getTitle();

    const token = getUserIdFromToken((req.headers.authorization).substring(7));
    let permissions = {};
    if(token) {
        if(await hasPermission(token, Permissions.ADMINISTRATOR)) {
            permissions = convertPermissionsToObject(userObj.permissions);
        }
    }

    res.json({
        "status": "ok",
        "username": userObj.username,
        "joined": userObj.dateOfEntry,
        "adminOfTournaments": tourneys,
        "rank": highestRank,
        "permissions": permissions
    });
});

export default router;