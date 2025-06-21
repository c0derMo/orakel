import type {
    IStageGameGroup,
    IStageGame,
    IGameReport,
} from "@shared/interfaces/IStageGame";
import {
    LoserOf,
    WinnerOf,
    type StagePlacement,
} from "../../../model/StagePlacement";
import { SimpleStageType } from "./simpleStageType";
import { StageMatch } from "model/StageMatch";

export class EliminationBracketStageType extends SimpleStageType {
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
        const seeds = Array(gamesThisRound * 2)
            .fill(null)
            .map((_, idx) => idx);
        const r1Matchups =
            EliminationBracketStageType.reverseGenerateHalfs(seeds);

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
                        this.stage.participants[r1Matchups[j][0]]
                            ?.participantId ?? "BYE",
                    );
                    game.participantIds.push(
                        this.stage.participants[r1Matchups[j][1]]
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
                        `Winner of match ${game.precessorGames[0]}`,
                    );
                    game.templateParticipantNames.push(
                        `Winner of match ${game.precessorGames[1]}`,
                    );

                    const upperMatchWinner = this.getMatchWinnerIndex(
                        game.precessorGames[0]!,
                    );
                    if (upperMatchWinner != null) {
                        game.participantIds.push(
                            games[game.precessorGames[0]! - 1].participantIds[
                                upperMatchWinner
                            ],
                        );
                    } else {
                        game.participantIds.push(null);
                    }

                    const lowerMatchWinner = this.getMatchWinnerIndex(
                        game.precessorGames[1]!,
                    );
                    if (lowerMatchWinner != null) {
                        game.participantIds.push(
                            games[game.precessorGames[1]! - 1].participantIds[
                                lowerMatchWinner
                            ],
                        );
                    } else {
                        game.participantIds.push(null);
                    }
                }

                games.push(game);
            }

            gamesThisRound /= 2;
            if (gamesThisRound < 1) {
                break;
            }
        }
        return EliminationBracketStageType.cleanUpByes(games);
    }

    getMatchWinnerIndex(matchNumber: number): number | null {
        const match = this.stage.matches.find(
            (match) => match.matchNumber === matchNumber,
        );
        if (match?.result == null) {
            return null;
        }
        if (match.result.scores[0] > match.result.scores[1]) {
            return 0;
        } else if (match.result.scores[1] > match.result.scores[0]) {
            return 1;
        }
        return null;
    }

    async resolveMatch(match: IStageGame, report: IGameReport): Promise<void> {
        const otherMatches = await StageMatch.find({
            where: {
                tournamentId: match.tournamentId,
                stageNumber: match.stageNumber,
            },
        });

        for (const otherMatch of otherMatches) {
            const index = otherMatch.precessorGames.findIndex(
                (num) => num === match.matchNumber,
            );
            if (index === -1) {
                continue;
            }
            const winner =
                report.scores[0] > report.scores[1]
                    ? match.participantIds[0]
                    : match.participantIds[1];
            otherMatch.participantIds[index] = winner;
            await otherMatch.save();
        }
    }

    private static reverseGenerateHalfs(
        participantsIncludingByes: number[],
    ): number[][] {
        if (
            Math.log2(participantsIncludingByes.length) % 1 !== 0 ||
            participantsIncludingByes.length < 2
        ) {
            throw new Error(
                `Bracket isnt perfect, participants: ${participantsIncludingByes.length}`,
            );
        }

        if (participantsIncludingByes.length == 2) {
            return [participantsIncludingByes];
        }

        const upperHalf: number[] = [participantsIncludingByes.pop()!];
        const lowerHalf: number[] = [];
        let lHalf = true;
        for (let i = participantsIncludingByes.length - 1; i > 1; i -= 2) {
            if (lHalf) {
                lowerHalf.push(participantsIncludingByes.pop()!);
                lowerHalf.push(participantsIncludingByes.pop()!);
            } else {
                upperHalf.push(participantsIncludingByes.pop()!);
                upperHalf.push(participantsIncludingByes.pop()!);
            }
            lHalf = !lHalf;
        }
        upperHalf.push(participantsIncludingByes.pop()!);

        return [
            ...EliminationBracketStageType.reverseGenerateHalfs(
                upperHalf.toReversed(),
            ),
            ...EliminationBracketStageType.reverseGenerateHalfs(
                lowerHalf.toReversed(),
            ),
        ];
    }

    private static cleanUpByes(matches: IStageGame[]): IStageGame[] {
        const byedMatches = new Map<number, string>();
        const resultingMatches: IStageGame[] = [];

        for (const match of matches) {
            if (match.participantIds[0] === "BYE") {
                byedMatches.set(match.matchNumber, match.participantIds[1]!);
            } else if (match.participantIds[1] === "BYE") {
                byedMatches.set(match.matchNumber, match.participantIds[0]!);
            } else {
                match.matchNumber -= byedMatches.size;
                for (let i = 0; i < match.precessorGames.length; i++) {
                    if (
                        match.precessorGames[i] != null &&
                        byedMatches.has(match.precessorGames[i]!)
                    ) {
                        match.participantIds[i] = byedMatches.get(
                            match.precessorGames[i]!,
                        )!;
                        match.precessorGames[i] = null;
                    }
                }
                match.precessorGames = match.precessorGames.map((matchNum) => {
                    if (matchNum == null) {
                        return null;
                    }
                    const reduceBy = [...byedMatches.keys()].findLastIndex(
                        (v) => v <= matchNum,
                    );
                    if (reduceBy === -1) {
                        return matchNum;
                    } else {
                        return matchNum - reduceBy - 1;
                    }
                });
                match.templateParticipantNames =
                    match.templateParticipantNames.map(
                        (_, idx) =>
                            `Winner of match ${match.precessorGames[idx]}`,
                    );
                resultingMatches.push(match);
            }
        }
        return resultingMatches;
    }

    getPlacements(): StagePlacement[] {
        const placements: StagePlacement[] = [];

        for (let i = 0; i < this.stage.participants.length - 1; i++) {
            placements.push(new LoserOf(i + 1));
        }

        placements.push(new WinnerOf(this.stage.participants.length - 1));

        return placements;
    }
}
