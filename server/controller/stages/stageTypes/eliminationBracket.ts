import { IStageGameGroup, IStageGame } from "@shared/interfaces/IStageGame";
import { TournamentStage } from "../../../model/TournamentStage";
import { StageType } from "./baseStageType";

export class EliminationBracketStageType extends StageType {
    constructor() {
        super("elimination_bracket", "Elimination Bracket");
    }

    getGameGroups(stage: TournamentStage): IStageGameGroup[] {
        const amountRounds = Math.ceil(Math.log2(stage.participants.length));
        const groups: IStageGameGroup[] = [];

        for (let i = 0; i < amountRounds; i++) {
            groups.push({
                tournamentId: stage.tournamentId,
                stageNumber: stage.stageNumber,
                groupNumber: i,
                title: `Round ${i + 1}`,
            });
        }

        return groups;
    }

    getGames(stage: TournamentStage): IStageGame[] {
        const games: IStageGame[] = [];
        const amountRounds = Math.ceil(Math.log2(stage.participants.length));
        let gamesThisRound = Math.pow(2, amountRounds) / 2;

        for (let i = 0; i < amountRounds; i++) {
            for (let j = 0; j < gamesThisRound; j++) {
                const gameNumber = games.length + 1;
                const game: IStageGame = {
                    tournamentId: stage.tournamentId,
                    stageNumber: stage.stageNumber,
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
                        stage.participants[2 * (gameNumber - 1)]
                            ?.participantId ?? "BYE",
                    );
                    game.participantIds.push(
                        stage.participants[2 * (gameNumber - 1) + 1]
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
                        stage,
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
                        stage,
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

                const match = stage.reportedGames.find(
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

    getMatchWinnerIndex(
        stage: TournamentStage,
        matchNumber: number,
    ): number | null {
        const match = stage.reportedGames.find(
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
}
