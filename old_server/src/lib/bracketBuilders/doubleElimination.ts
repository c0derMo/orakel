import {BracketBuilder} from "../brackets";
import {SingleEliminationBracketBuilder} from "./singleElimination";
import {ITournamentBracket} from "../../model/Tournament";

// I have no clue what this is for exactly, but I need it to type correctly
interface DropDownMatch {
    ident: number;
    index: number;
}

interface BracketRound {
    matches: BracketMatch[]
}

interface BracketTeam {
    id: string;
    name: string;
    score: number;
    dropDownFromRound?: number
    dropDownFromMatch?: number
}

interface BracketMatch {
    id: string;
    winner: string;
    team1: BracketTeam;
    team2: BracketTeam;
    title: string;
}

interface SingleEliminationBracket {
    rounds: BracketRound[];
    lbRounds?: BracketRound[];
}

export class DoubleEliminationBracketBuilder implements BracketBuilder {
    private seBuilder: SingleEliminationBracketBuilder;

    constructor() {
        this.seBuilder = new SingleEliminationBracketBuilder();
    }

    constructBracket(bracket: ITournamentBracket): unknown {
        const result = this.seBuilder.constructBracket(bracket) as SingleEliminationBracket;
        const amountRounds = Math.ceil(Math.log2(bracket.participants.length));

        let matchCounter = 1;
        for (const round of result.rounds) {
            for (const match of round.matches) {
                matchCounter++;
                match.title = "WB" + match.title;
            }
        }

        // LB Generation:
        if (bracket.type === "doubleElim") {
            const amountLBRounds = (Math.ceil(Math.log2(bracket.participants.length)) - 1) * 2;
            const amountUBMatches = (2 ** (Math.ceil(Math.log2(bracket.participants.length)))) / 2;
            let amountLBMatches = amountUBMatches;
            let lbMatchCounter = 1;

            const lbRounds: BracketRound[] = [];
            let loserCounter = 1;
            let dropDownRoundCounter = 0;
            let dropDownMatchCounter = 0;

            let dropDownMatches: DropDownMatch[] = [];

            for (let i = 0; i < amountLBRounds; i++) {
                if (i % 2 === 0) {
                    amountLBMatches /= 2;
                } else if (i % 2 === 1) {
                    dropDownRoundCounter++;
                    dropDownMatchCounter = 0;
                    dropDownMatches = [...Array(amountLBMatches) as number[]].map((_, i) => {
                        return {ident: i + loserCounter, index: i}
                    });
                    if ((i - 3) % 2 === 0 && dropDownMatches.length > 1 && i !== 1) {
                        const tmp = dropDownMatches.length / 2;
                        dropDownMatches = [...dropDownMatches.slice(tmp), ...dropDownMatches.slice(0, tmp)];
                    } else if ((i - 3) % 2 === 1 && dropDownMatches.length > 1 && i !== 1) {
                        dropDownMatches.reverse()
                        const tmp = dropDownMatches.length / 2;
                        dropDownMatches = [...dropDownMatches.slice(tmp), ...dropDownMatches.slice(0, tmp)];
                    }
                }
                if (i + 1 === amountLBRounds) {
                    lbMatchCounter++;
                }
                const matches: BracketMatch[] = [];
                for (let j = 0; j < amountLBMatches; j++) {
                    const match = {
                        id: `lbr${i}m${j}`,
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
                        title: `LB${lbMatchCounter}`
                    } as BracketMatch;

                    // Fill the matches with "Loser of X"... This might be fun
                    if (i === 0) {
                        // If we're in the first round, we just count up
                        match.team1.name = `Loser of WB${loserCounter}`;
                        match.team1.dropDownFromRound = dropDownRoundCounter;
                        match.team1.dropDownFromMatch = dropDownMatchCounter;
                        dropDownMatchCounter++;
                        loserCounter++;
                        match.team2.name = `Loser of WB${loserCounter}`;
                        match.team2.dropDownFromRound = dropDownRoundCounter;
                        match.team2.dropDownFromMatch = dropDownMatchCounter;
                        dropDownMatchCounter++;
                        loserCounter++;
                    } else if (i % 2 === 1) {
                        /*
                         * Only every second round we get new losers
                         * THERE'S A FORMULA FOR THAT
                         * ...maybe
                         */
                        const dropDownMatch = dropDownMatches.pop()
                        match.team1.name = `Loser of WB${dropDownMatch.ident}`;
                        match.team1.dropDownFromRound = dropDownRoundCounter;
                        match.team1.dropDownFromMatch = dropDownMatch.index;
                        loserCounter++;
                    }

                    // Populating the LB by iterating over UB, seeing if it has losers
                    if (match.team1.dropDownFromMatch !== -1) {
                        // Here, a new team drops down
                        const dropMatch = result.rounds[match.team1.dropDownFromRound].matches[match.team1.dropDownFromMatch];

                        if (dropMatch.winner === dropMatch.team1.id) {
                            match.team1.id = dropMatch.team2.id;
                        } else if (dropMatch.winner === dropMatch.team2.id) {
                            match.team1.id = dropMatch.team1.id;
                        }
                    } else {
                        // This spot will be taken from previous winner
                        let winMatch: BracketMatch;
                        if (i % 2 === 0) {
                            // Last round has twice this one's matches
                            winMatch = lbRounds[i - 1].matches[(j * 2)];
                        } else {
                            // Last round has same amount of amatches
                            winMatch = lbRounds[i - 1].matches[j];
                        }
                        if (winMatch.winner === winMatch.team1.id) {
                            match.team1.id = winMatch.team1.id;
                        } else if (winMatch.winner === winMatch.team2.id) {
                            match.team1.id = winMatch.team2.id;
                        }
                    }
                    if (match.team2.dropDownFromMatch !== -1) {
                        // Here, a new team drops down
                        const dropMatch = result.rounds[match.team2.dropDownFromRound].matches[match.team2.dropDownFromMatch]
                        if (dropMatch.winner === dropMatch.team1.id) {
                            match.team2.id = dropMatch.team2.id;
                        } else if (dropMatch.winner === dropMatch.team2.id) {
                            match.team2.id = dropMatch.team1.id;
                        }
                    } else {
                        // This spot will be taken from previous winner
                        let winMatch: BracketMatch;
                        if (i % 2 === 0) {
                            // Last round has twice this one's matches
                            winMatch = lbRounds[i - 1].matches[(j * 2) + 1];
                        } else {
                            // Last round has same amount of amatches
                            winMatch = lbRounds[i - 1].matches[j];
                        }
                        if (winMatch.winner === winMatch.team1.id) {
                            match.team2.id = winMatch.team1.id;
                        } else if (winMatch.winner === winMatch.team2.id) {
                            match.team2.id = winMatch.team2.id;
                        }
                    }

                    if (match.team1.id !== "" && match.team2.id !== "") {
                        // If we have both teams, we need to sort them
                        const teams = [match.team1.id, match.team2.id];
                        teams.sort((a, b) => {
                            return parseInt(a) - parseInt(b)
                        });
                        match.team1.id = teams[0];
                        match.team1.name = bracket.participants[parseInt(teams[0])].name;
                        match.team2.id = teams[1];
                        match.team2.name = bracket.participants[parseInt(teams[1])].name;

                        // Since we have a "working match", we can see if we have data for it
                        if (match.team1.name === "BYE") {
                            match.winner = match.team2.id;
                            match.team2.score = 1;
                        } else if (match.team2.name === "BYE") {
                            match.winner = match.team1.id;
                            match.team1.score = 1;
                        } else {
                            const matchData = bracket.matches.find(e => {
                                return e.id === match.id
                            });
                            if (matchData) {
                                match.team1.score = matchData.score1;
                                match.team2.score = matchData.score2;
                                if (matchData.score1 > matchData.score2) {
                                    match.winner = match.team1.id;
                                } else if (matchData.score2 > matchData.score1) {
                                    match.winner = match.team2.id;
                                }
                            }
                        }
                    } else {
                        if (match.team1.id !== "") {
                            match.team1.name = bracket.participants[parseInt(match.team1.id)].name;
                        }
                        if (match.team2.id !== "") {
                            match.team2.name = bracket.participants[parseInt(match.team2.id)].name;
                        }
                    }

                    lbMatchCounter++;
                    matches.push(match);
                }
                lbRounds.push({matches: matches});
            }
            /*
             * fixing the last match-title... maybe
             * lbRounds[amountLBRounds - 1].matches[0].title -= 1;
             * EDIT: Future-mo: okay, what the fuck, this is not how this works
             * `title` is a string, always has been, but has a number at the end, and I tried subtracting from the
             * trailing number in a string? did this work? shouldnt have worked to be sure?
             * TODO
             */
            result.lbRounds = lbRounds;
        }

        // Grand Finals below
        if (bracket.type === "doubleElim") {
            const match = {
                id: `r${amountRounds}m0`,
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

            match.title = `WB$${matchCounter}`;
            matchCounter++;

            let ubWinner: string;
            // Wait, wha-... how is this always undefined?? TODO
            const lbWinner: string = undefined;
            if (result.rounds[amountRounds - 1].matches[0].winner !== '0') {
                ubWinner = result.rounds[amountRounds - 1].matches[0].winner;
            }
            // If lbWinner, set lbWinner to lbWinner
            if (ubWinner !== undefined && lbWinner !== undefined) {
                const teams = [
                    ubWinner, lbWinner
                ];
                teams.sort();
                match.team1.id = teams[0];
                match.team1.name = bracket.participants[parseInt(teams[0])].name;
                match.team2.id = teams[1];
                match.team2.name = bracket.participants[parseInt(teams[1])].name;
            } else {
                if (ubWinner !== undefined) {
                    match.team1.id = ubWinner;
                    match.team1.name = bracket.participants[parseInt(ubWinner)].name;
                }
                if (lbWinner !== undefined) {
                    match.team2.id = lbWinner;
                    match.team2.name = bracket.participants[parseInt(lbWinner)].name;
                }
            }

            const matchInfo = bracket.matches.find(e => {
                return e.id === match.id
            });
            if (matchInfo) {
                match.team1.score = matchInfo.score1;
                match.team2.score = matchInfo.score2;
                if (matchInfo.score1 > matchInfo.score2) {
                    match.winner = match.team1.id;
                } else if (matchInfo.score2 > matchInfo.score1) {
                    match.winner = match.team2.id;
                }
            }

            result.rounds.push({
                matches: [match]
            });
        }
        return result;
    }
}
