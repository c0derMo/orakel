import * as express from "express";
import { connect } from "./database/database";
import * as bcrypt from 'bcrypt';
const cors = require("cors");
const bodyParser = require("body-parser");
import * as jwt from 'jsonwebtoken';
import Authenticator from "./authenticator";

require("dotenv").config();

const app = express();
const port = 5002;
const tokenSecret = "SuperSecretDevToken";

app.use(cors({
    origin: "http://localhost:8080"
}));
app.use(bodyParser.json());
//TODO: Figure out, how to put in routers....
// app.
// app.route("/api/users", Authenticator);

let db = connect();

app.get("/tournament/:tid", async (req, res) => {
    let tourneyname = req.params.tid;

    let tourney = await db.TournamentModel.findOneOrCreate(tourneyname);

    let amountRounds = Math.ceil(Math.log2(tourney.participants.length));
    let amountMatches = (2**(Math.ceil(Math.log2(tourney.participants.length)))) / 2;

    let rounds = [];
    for(let i = 0; i<amountRounds; i++) {
        let matches = [];
        for(let j = 0; j<amountMatches; j++) {
            let match = {
                id: "r" + i + "m" + j,
                winner: "0",
                team1: {
                    id: "",
                    name: "",
                    score: 0
                },
                team2: {
                    id: "",
                    name: "",
                    score: 0
                }
            }
            if(i == 0) {
                let topSeed = j+1;
                let bottomSeed = j+1+amountMatches;
                match.team1.id = topSeed.toString();
                match.team2.id = bottomSeed.toString();
                match.team1.name = await tourney.getParticipantBySeed(topSeed)
                match.team2.name = await tourney.getParticipantBySeed(bottomSeed)
                if(match.team1.name == "BYE") {
                    match.team2.score = 1;
                    match.winner = match.team2.id;
                } else if(match.team2.name == "BYE") {
                    match.team1.score = 1;
                    match.winner = match.team1.id;
                }
            } else {
                let topMatch = rounds[i-1].matchs[j*2];
                let bottomMatch = rounds[i-1].matchs[(j*2)+1];
                let teams = [];
                if(topMatch.winner !== "0") {
                    teams.push(topMatch.winner);
                }
                if(bottomMatch.winner !== "0") {
                    teams.push(bottomMatch.winner);
                }
                if(teams.length > 1) {
                    teams.sort();
                    match.team1.id = teams[0];
                    match.team1.name = await tourney.getParticipantBySeed(parseInt(teams[0]));
                    match.team2.id = teams[1];
                    match.team2.name = await tourney.getParticipantBySeed(parseInt(teams[1]));
                } else if(teams.length > 0) {
                    match.team1.id = teams[0];
                    match.team1.name = await tourney.getParticipantBySeed(parseInt(teams[0]));
                }
            }
            let matchInfo = tourney.matches.find(e => { return e.id == match.id });
            if(matchInfo) {
                match.team1.score = matchInfo.score1;
                match.team2.score = matchInfo.score2;
                if(matchInfo.score1 > matchInfo.score2) {
                    match.winner = match.team1.id;
                } else if(matchInfo.score2 > matchInfo.score1) {
                    match.winner = match.team2.id;
                }
            }
            matches.push(match);
        }
        rounds.push({
            matchs: matches,
            matches: matches
        });
        amountMatches /= 2;
    }

    res.json({ rounds: rounds });
});

app.patch("/tournament/:tid/updateMatch/:mID", async (req, res) => {
    let tourneyname = req.params.tid;
    let matchid = req.params.mID;

    let tourney = await db.TournamentModel.findOneOrCreate(tourneyname);

    tourney.updateMatch(matchid, req.body.score1, req.body.score2);

    res.json({"status": "ok"});
});

app.post("/login", async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let user = await db.UserModel.findOne({username: username});
    if(!user) {
        res.json({"authenticated": false});
        return;
    }
    let match = await bcrypt.compare(password, user.passwordHash);
    //let match = true;

    if(match) {
        let userObj = {
            "displayName": user.displayname,
            "permissions": user.permissions
        }
        let token = jwt.sign({
            userId: user._id
        },
        tokenSecret, {
            expiresIn: '7d'
        })
        res.json({"authenticated": true, "user": userObj, "token": token});
    } else {
        res.json({"authenticated": false});
    }
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});