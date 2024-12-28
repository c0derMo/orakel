import {BracketBuilder} from "../brackets";
import {ITournamentBracket} from "../../model/Tournament";

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

export class SingleEliminationBracketBuilder implements BracketBuilder {
    constructBracket(bracket: ITournamentBracket): unknown {
        const amountRounds = Math.ceil(Math.log2(bracket.participants.length));
        let amountMatches = (2 ** (Math.ceil(Math.log2(bracket.participants.length)))) / 2;

        const rounds: BracketRound[] = [];
        let matchCounter = 1;

        const firstRoundTopSeeds = [1, 2];

        while (firstRoundTopSeeds.length < amountMatches) {
            const newLength = (firstRoundTopSeeds.length * 2) + 1
            const currentLength = firstRoundTopSeeds.length;
            for (let i = 0; i < currentLength; i++) {
                firstRoundTopSeeds.splice((2 * i) + 1, 0, newLength - firstRoundTopSeeds[(i * 2)]);
            }
        }

        for (let i = 0; i < amountRounds; i++) {
            const matches: BracketMatch[] = [];
            for (let j = 0; j < amountMatches; j++) {
                const match = {
                    id: `r${i}m${j}`,
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
                    title: matchCounter.toString()
                } as BracketMatch
                if (i === 0) {
                    //let topSeed = j+1;
                    const topSeed = firstRoundTopSeeds[j];
                    //let bottomSeed = (amountMatches*2) - j;
                    const bottomSeed = (amountMatches * 2) - topSeed + 1;
                    match.team1.id = topSeed.toString();
                    match.team2.id = bottomSeed.toString();
                    match.team1.name = bracket.participants[topSeed].name
                    match.team2.name = bracket.participants[bottomSeed].name
                    if (match.team1.name === "BYE") {
                        match.team2.score = 1;
                        match.winner = match.team2.id;
                    } else if (match.team2.name === "BYE") {
                        match.team1.score = 1;
                        match.winner = match.team1.id;
                    }
                } else {
                    const topMatch = rounds[i - 1].matches[j * 2];
                    const bottomMatch = rounds[i - 1].matches[(j * 2) + 1];
                    const teams: string[] = [];
                    if (topMatch.winner !== "0") {
                        teams.push(topMatch.winner);
                    }
                    if (bottomMatch.winner !== "0") {
                        teams.push(bottomMatch.winner);
                    }
                    if (teams.length > 1) {
                        teams.sort((a, b) => {
                            return parseInt(a) - parseInt(b)
                        });
                        match.team1.id = teams[0];
                        match.team1.name = bracket.participants[parseInt(teams[0])].name;
                        match.team2.id = teams[1];
                        match.team2.name = bracket.participants[parseInt(teams[1])].name;
                    } else if (teams.length > 0) {
                        match.team1.id = teams[0];
                        match.team1.name = bracket.participants[parseInt(teams[0])].name;
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
                matchCounter++;
                matches.push(match);
            }
            rounds.push({
                matches: matches
            });
            amountMatches /= 2;
        }

        return {
            rounds: rounds
        };
    }
}
