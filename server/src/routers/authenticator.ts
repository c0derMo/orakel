import { Router }  from "express"
import { tryLogin, getUserIdFromToken, Permissions, hasPermission, convertPermissionsToObject } from "../lib/auth";
import { getDatabase } from "../database/databaseConnector";

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

    const userObj = await getDatabase().getUserByName(user);
    if(!userObj) {
        res.json({"status": "not found"});
        return;
    }

    const uID = userObj.id;
    const tournaments = await getDatabase().getAllTournaments();

    const tourneys: string[] = [];
    tournaments.forEach((e) => {
        if(e.organizor === uID || e.administrators.includes(uID)) tourneys.push(e.name);
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
        "joined": userObj.registrationDate,
        "adminOfTournaments": tourneys,
        "rank": highestRank,
        "permissions": permissions
    });
});

export default router;
