import { Router } from "express";
import { TournamentModel } from "../database/schemas/tournament";
import { UserModel } from "../database/schemas/users";
import { getUserIdFromToken, hasPermission, Permissions } from "./authenticator";

const router = Router();

router.get("/get/:tid", async(req, res) => {
    let tourneyname = req.params.tid;

    let tourney = await TournamentModel.findOne({name: tourneyname});

    if(!tourney) {
        res.json({"status": "error"});
        return;
    }

    if(tourney.private) {
        let uID = getUserIdFromToken((req.headers["authorization"] as string).substring(7));
        if(!uID) {
            res.json({"status": "unauthorized"});
            return;
        } else {
            if(uID != tourney.organizor && !hasPermission(uID, Permissions.ADMINISTRATOR)) {
                res.json({"status": "unauthorized"});
                return;
            }
        }
    }

    let amountRounds = Math.ceil(Math.log2(tourney.participants.length));
    let amountMatches = (2**(Math.ceil(Math.log2(tourney.participants.length)))) / 2;

    let rounds = [];
    let matchCounter = 1;

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
                },
                title: undefined
            }
            if(tourney.doubleElim) match.title = "WB" + matchCounter;
            if(i == 0) {
                let topSeed = j+1;
                let bottomSeed = (amountMatches*2) - j;
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
                let topMatch = rounds[i-1].matches[j*2];
                let bottomMatch = rounds[i-1].matches[(j*2)+1];
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
            matchCounter++;
            matches.push(match);
        }
        rounds.push({
            matches: matches
        });
        amountMatches /= 2;
    }

    let result = { 
        rounds: rounds,
        lbRounds: undefined
    };

    // LB Generation:
    if(tourney.doubleElim) {
        let amountLBRounds = (Math.ceil(Math.log2(tourney.participants.length))-1) * 2;
        let amountUBMatches = (2**(Math.ceil(Math.log2(tourney.participants.length)))) / 2;
        let amountLBMatches = amountUBMatches;
        let lbMatchCounter = 1;
        
        let lbRounds = [];
        let loserCounter = 1;
        let dropDownRoundCounter = 0;
        let dropDownMatchCounter = 0;

        for(let i = 0; i<amountLBRounds; i++) {
            if(i % 2 == 0) {
                amountLBMatches /= 2;
            } else if(i % 2 == 1) {
                dropDownRoundCounter++;
                dropDownMatchCounter = 0;
            }
            if(i+1 == amountLBRounds) {
                lbMatchCounter++;
            }
            let matches = [];
            for(let j = 0; j<amountLBMatches; j++) {
                let match = {
                    id: 'lbr' + i + 'm' + j,
                    winner: "0",
                    team1: {
                        id: "",
                        name: "",
                        score: 0,
                        dropDownFromRound: -1,
                        dropDownFromMatch: -1
                    },
                    team2: {
                        id: "",
                        name: "",
                        score: 0,
                        dropDownFromRound: -1,
                        dropDownFromMatch: -1
                    },
                    title: "LB" + lbMatchCounter
                };

                // Fill the matches with "Loser of X"... This might be fun
                if(i == 0) {
                    // If we're in the first round, we just count up
                    match.team1.name = "Loser of WB" + loserCounter;
                    match.team1.dropDownFromRound = dropDownRoundCounter;
                    match.team1.dropDownFromMatch = dropDownMatchCounter;
                    dropDownMatchCounter++;
                    loserCounter++;
                    match.team2.name = "Loser of WB" + loserCounter;
                    match.team2.dropDownFromRound = dropDownRoundCounter;
                    match.team2.dropDownFromMatch = dropDownMatchCounter;
                    dropDownMatchCounter++;
                    loserCounter++;
                } else if(i % 2 == 1) {
                    // Only every second round we get new losers
                    // THERE'S A FORMULA FOR THAT
                    match.team1.name = "Loser of WB" + loserCounter;
                    match.team1.dropDownFromRound = dropDownRoundCounter;
                    match.team1.dropDownFromMatch = dropDownMatchCounter;
                    dropDownMatchCounter++;
                    loserCounter++;
                }

                // Populating the LB by iterating over UB, seeing if it has losers
                if(match.team1.dropDownFromMatch !== -1) {
                    // Here, a new team drops down
                    const dropMatch = result.rounds[match.team1.dropDownFromRound].matches[match.team1.dropDownFromMatch];
                    
                    if(dropMatch.winner === dropMatch.team1.id) {
                        match.team1.id = dropMatch.team2.id;
                    } else if(dropMatch.winner === dropMatch.team2.id) {
                        match.team1.id = dropMatch.team1.id;
                    }
                } else {
                    // This spot will be taken from previous winner
                    let winMatch;
                    if(i % 2 == 0) {
                        // Last round has twice this one's matches
                        winMatch = lbRounds[i-1].matches[(j*2)];
                    } else {
                        // Last round has same amount of amatches
                        winMatch = lbRounds[i-1].matches[j];
                    }
                    if(winMatch.winner === winMatch.team1.id) {
                        match.team1.id = winMatch.team1.id;
                    } else if(winMatch.winner === winMatch.team2.id) {
                        match.team1.id = winMatch.team2.id;
                    }
                }
                if(match.team2.dropDownFromMatch !== -1) {
                    // Here, a new team drops down
                    const dropMatch = result.rounds[match.team2.dropDownFromRound].matches[match.team2.dropDownFromMatch]
                    if(dropMatch.winner === dropMatch.team1.id) {
                        match.team2.id = dropMatch.team2.id;
                    } else if(dropMatch.winner === dropMatch.team2.id) {
                        match.team2.id = dropMatch.team1.id;
                    }
                } else {
                    // This spot will be taken from previous winner
                    let winMatch;
                    if(i % 2 == 0) {
                        // Last round has twice this one's matches
                        winMatch = lbRounds[i-1].matches[(j*2)+1];
                    } else {
                        // Last round has same amount of amatches
                        winMatch = lbRounds[i-1].matches[j];
                    }
                    if(winMatch.winner === winMatch.team1.id) {
                        match.team2.id = winMatch.team1.id;
                    } else if(winMatch.winner === winMatch.team2.id) {
                        match.team2.id = winMatch.team2.id;
                    }
                }

                if(match.team1.id !== "" && match.team2.id !== "") {
                    // If we have both teams, we need to sort them
                    let teams = [match.team1.id, match.team2.id];
                    teams.sort();
                    match.team1.id = teams[0];
                    match.team1.name = await tourney.getParticipantBySeed(parseInt(teams[0]));
                    match.team2.id = teams[1];
                    match.team2.name = await tourney.getParticipantBySeed(parseInt(teams[1]));

                    // Since we have a "working match", we can see if we have data for it
                    if(match.team1.name == "BYE") {
                        match.winner = match.team2.id;
                        match.team2.score = 1;
                    } else if(match.team2.name == "BYE") {
                        match.winner = match.team1.id;
                        match.team1.score = 1;
                    } else {
                        const matchData = tourney.matches.find(e => { return e.id == match.id });
                        if(matchData) {
                            match.team1.score = matchData.score1;
                            match.team2.score = matchData.score2;
                            if(matchData.score1 > matchData.score2) {
                                match.winner = match.team1.id;
                            } else if(matchData.score2 > matchData.score1) {
                                match.winner = match.team2.id;
                            }
                        }
                    }
                } else {
                    if(match.team1.id !== "") {
                        match.team1.name = await tourney.getParticipantBySeed(parseInt(match.team1.id));
                    }
                    if(match.team2.id !== "") {
                        match.team2.name = await tourney.getParticipantBySeed(parseInt(match.team2.id));
                    }
                }

                lbMatchCounter++;
                matches.push(match);
            }
            lbRounds.push({matches: matches});
        }
        // fixing the last match-title... maybe
        lbRounds[amountLBRounds-1].matches[0].title -= 1;

        result.lbRounds = lbRounds;
    }

    // Grand Finals below
    if(tourney.doubleElim) {
        let match = {
            id: "r" + amountRounds + "m0",
            winner: "0",
            team1: {
                id: "",
                name: "",
                score: 0
            },
            team2: {
                id: "",
                name: "Winner of LB",
                score: 0
            },
            title: ""
        };

        match.title = "WB" + matchCounter;
        matchCounter++;

        let ubWinner = undefined;
        let lbWinner = undefined;
        if(rounds[amountRounds-1].matches[0].winner !== '0') {
            ubWinner = rounds[amountRounds-1].matches[0].winner;
        }
        // If lbWinner, set lbWinner to lbWinner
        if(ubWinner !== undefined && lbWinner !== undefined) {
            let teams = [
                ubWinner, lbWinner
            ];
            teams.sort();
            match.team1.id = teams[0];
            match.team1.name = await tourney.getParticipantBySeed(parseInt(teams[0]));
            match.team2.id = teams[1];
            match.team2.name = await tourney.getParticipantBySeed(parseInt(teams[1]));
        } else {
            if(ubWinner !== undefined) {
                match.team1.id = ubWinner;
                match.team1.name = await tourney.getParticipantBySeed(parseInt(ubWinner));
            }
            if(lbWinner !== undefined) {
                match.team2.id = lbWinner;
                match.team2.name = await tourney.getParticipantBySeed(parseInt(lbWinner));
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

        rounds.push({
            matches: [match]
        });
        result.rounds = rounds;
    }

    res.json(result);
});

router.get("/get/:tid/metadata", async (req, res) => {
    let tourneyname = req.params.tid;

    let tourney = await TournamentModel.findOne({name: tourneyname});

    if(!tourney) {
        res.send({"status": "error"});
        return;
    }

    if(tourney.private) {
        let uID = getUserIdFromToken((req.headers["authorization"] as string).substring(7));
        if(!uID) {
            res.json({"status": "unauthorized"});
            return;
        } else {
            if(uID != tourney.organizor && !hasPermission(uID, Permissions.ADMINISTRATOR)) {
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
        "doubleElim": tourney.doubleElim
    })
});

router.patch("/get/:tid/updateMatch/:mID", async (req, res) => {
    let tourneyname = req.params.tid;
    let matchid = req.params.mID;
    let token: string = req.headers["authorization"] as string;

    let uID = getUserIdFromToken(token.substring(7));
    if(!uID) {
        res.json({"status": "unauthorized"});
        return;
    }

    let tourney = await TournamentModel.findOne({name: tourneyname});

    if(!tourney) {
        res.json({"status": "error"});
        return;
    }
    if(!tourney.hasPermissions(uID)) {
        res.json({"status": "unauthorized"});
        return;
    }

    await tourney.updateMatch(matchid, req.body.score1, req.body.score2, uID);

    res.json({"status": "ok"});
});

router.get("/list", async (req, res) => {
    let tourneys = await TournamentModel.find();
    let result = [];
    let token: string = req.headers["authorization"] as string;

    let uID = getUserIdFromToken(token.substring(7));
    let admin = false;
    if(uID) {
        admin = await hasPermission(uID, Permissions.ADMINISTRATOR);
    }

    for(let e of tourneys) {
        if(!e.private || admin) {
            let creator = "SYSTEM";
            if(e.organizor) {
                creator = (await UserModel.findById(e.organizor)).username;
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