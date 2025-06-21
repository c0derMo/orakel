import type {
    IStageGameGroup,
    IStageGame,
} from "@shared/interfaces/IStageGame";
import { StageType } from "./baseStageType";
import {
    LoserOf,
    WinnerOf,
    type StagePlacement,
} from "../../../model/StagePlacement";

export class EliminationBracketStageType extends StageType {
    public static readonly name = "elimination_bracket";
    public static readonly publicName = "Elimination Bracket";

    getGameGroups(): IStageGameGroup[] {
        const amountRounds = Math.ceil(
            Math.log2(this.stage.participants.length),
        );
        const groups: IStageGameGroup[] = [];

        for (let i = 0; i < amountRounds; i++) {
            groups.push({
                tournamentId: this.stage.tournamentId,
                stageNumber: this.stage.stageNumber,
                groupNumber: i,
                title: `Round ${i + 1}`,
            });
        }

        return groups;
    }

    getGames(): IStageGame[] {
        const games: IStageGame[] = [];
        const amountRounds = Math.ceil(
            Math.log2(this.stage.participants.length),
        );
        let gamesThisRound = Math.pow(2, amountRounds) / 2;

        for (let i = 0; i < amountRounds; i++) {
            for (let j = 0; j < gamesThisRound; j++) {
                const gameNumber = games.length + 1;
                const game: IStageGame = {
                    tournamentId: this.stage.tournamentId,
                    stageNumber: this.stage.stageNumber,
                    matchNumber: gameNumber,
                    groupNumber: i,
                    participantIds: [],
                    precessorGames: [],
                    templateParticipantNames: [],
                    participants: 2,
                };
                if (i === 0) {
                    // In first round, we add all the players who are participating
                    game.participantIds.push(
                        this.stage.participants[2 * (gameNumber - 1)]
                            ?.participantId ?? "BYE",
                    );
                    game.participantIds.push(
                        this.stage.participants[2 * (gameNumber - 1) + 1]
                            ?.participantId ?? "BYE",
                    );
                } else {
                    const gamesInPreviousRound = gamesThisRound * 2;
                    const firstGameThisGroup = games.findIndex(
                        (g) => g.groupNumber === i,
                    );
                    const gameNumberThisGroup =
                        firstGameThisGroup === -1
                            ? 0
                            : gameNumber - firstGameThisGroup - 1;
                    game.precessorGames.push(
                        gameNumber - gamesInPreviousRound + gameNumberThisGroup,
                    );
                    game.precessorGames.push(
                        gameNumber -
                            gamesInPreviousRound +
                            gameNumberThisGroup +
                            1,
                    );

                    game.templateParticipantNames.push(
                        `Winner of game ${game.precessorGames[0]}`,
                    );
                    game.templateParticipantNames.push(
                        `Winner of game ${game.precessorGames[1]}`,
                    );

                    const upperMatchWinner = this.getMatchWinnerIndex(
                        game.precessorGames[0],
                    );
                    if (upperMatchWinner != null) {
                        game.participantIds.push(
                            games[game.precessorGames[0] - 1].participantIds[
                                upperMatchWinner
                            ],
                        );
                    } else {
                        game.participantIds.push(null);
                    }

                    const lowerMatchWinner = this.getMatchWinnerIndex(
                        game.precessorGames[1],
                    );
                    if (lowerMatchWinner != null) {
                        game.participantIds.push(
                            games[game.precessorGames[1] - 1].participantIds[
                                lowerMatchWinner
                            ],
                        );
                    } else {
                        game.participantIds.push(null);
                    }
                }

                const match = this.stage.reportedGames.find(
                    (match) => match.matchNumber === gameNumber,
                );
                if (match != null) {
                    game.result = match;
                }

                games.push(game);
            }

            gamesThisRound /= 2;
            if (gamesThisRound < 1) {
                break;
            }
        }
        return games;
    }

    getMatchWinnerIndex(matchNumber: number): number | null {
        const match = this.stage.reportedGames.find(
            (match) => match.matchNumber === matchNumber,
        );
        if (match == null) {
            return null;
        }
        if (match.scores[0] > match.scores[1]) {
            return 0;
        } else if (match.scores[1] > match.scores[0]) {
            return 1;
        }
        return null;
    }

    getPlacements(): StagePlacement[] {
        const placements: StagePlacement[] = [];

        for (let i = 0; i < this.stage.participants.length - 1; i++) {
            placements.push(new LoserOf(i));
        }

        placements.push(new WinnerOf(this.stage.participants.length - 1));

        return placements;
    }
}
