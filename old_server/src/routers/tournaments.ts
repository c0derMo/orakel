import { Router } from "express";
import { getUserIdFromToken, hasPermission, Permissions } from "../lib/auth";
import {getDatabase} from "../database/databaseConnector";
import {constructBracket} from "../lib/brackets";

const router = Router();

interface UpdateBody {
    score1: number;
    score2: number;
}

router.get("/get/:tid", async (req, res) => {
    const tourneyname = req.params.tid;

    const tourney = await getDatabase().getTournamentByName(tourneyname);

    if (!tourney) {
        res.json({"status": "error"});
        return;
    }

    if (tourney.private) {
        const uID = getUserIdFromToken((req.headers.authorization).substring(7));
        if (!uID) {
            res.json({"status": "unauthorized"});
            return;
        } else {
            if (uID !== tourney.organizor && !await hasPermission(uID, Permissions.ADMINISTRATOR) && !await tourney.hasPermissions(uID)) {
                res.json({"status": "unauthorized"});
                return;
            }
        }
    }

    const brackets = {};

    for (const bracketName in tourney.brackets) {
        const bracket = tourney.brackets[bracketName];

        brackets[bracketName] = constructBracket(bracket);
    }

    res.json(brackets);
});

router.get("/get/:tid/metadata", async (req, res) => {
    const tourneyname = req.params.tid;

    const tourney = await getDatabase().getTournamentByName(tourneyname);

    if(!tourney) {
        res.send({"status": "error"});
        return;
    }

    if(tourney.private) {
        const uID = getUserIdFromToken((req.headers.authorization).substring(7));
        if(!uID) {
            res.json({"status": "unauthorized"});
            return;
        } else {
            if(uID !== tourney.organizor && !await hasPermission(uID, Permissions.ADMINISTRATOR) && !await tourney.hasPermissions(uID)) {
                res.json({"status": "unauthorized"});
                return;
            }
        }
    }

    res.send({
        "status": "ok",
        "organizor": {
            "id": tourney.organizor
        },
        "brackets": tourney.brackets,
        "admins": tourney.administrators
    })
});

router.patch("/get/:tid/:bracket/updateMatch/:mID", async (req, res) => {
    const tourneyname = req.params.tid;
    const matchid = req.params.mID;
    const bracket = req.params.bracket;
    const token = req.headers.authorization;

    const uID = getUserIdFromToken(token.substring(7));
    if(!uID) {
        res.json({"status": "unauthorized"});
        return;
    }

    const tourney = await getDatabase().getTournamentByName(tourneyname);

    if(!tourney) {
        res.json({"status": "error"});
        return;
    }
    if(!await tourney.hasPermissions(uID)) {
        res.json({"status": "unauthorized"});
        return;
    }

    await tourney.updateMatch(bracket, {
        id: matchid,
        score1: (req.body as UpdateBody).score1,
        score2: (req.body as UpdateBody).score2
    });

    res.json({"status": "ok"});
});

router.get("/list", async (req, res) => {
    const tourneys = await getDatabase().getAllTournaments();
    const result = [];
    const token = req.headers.authorization;

    const uID = getUserIdFromToken(token.substring(7));
    let admin = false;
    if(uID) {
        admin = await hasPermission(uID, Permissions.ADMINISTRATOR);
    }

    for(const e of tourneys) {
        if(!e.private || admin) {
            let creator = "SYSTEM";
            if(e.organizor) {
                creator = (await getDatabase().getUserById(e.organizor)).username;
            }
            result.push({
                name: e.name,
                private: e.private,
                organizor: creator
            });
        }
    }

    res.json(result);
});

export default router;
