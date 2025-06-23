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

export class LowerEliminationBracketStageType extends SimpleStageType {
    public static readonly name = "lower_elimination_bracket";
    public static readonly publicName = "Lower Elimination Bracket";

    /*
        TODOs:
        - Figure out who gets forfeits r1
        - Figure out how to place players

     */

    getGameGroups(): IStageGameGroup[] {
        const amountRounds = Math.ceil(
            Math.log2(this.stage.participants.length) * 2 - 2,
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
            Math.log2(this.stage.participants.length) * 2 - 2,
        );

        let matchNumber = (Math.pow(2, amountRounds / 2) - 1) * 2;
        let gamesThisRound = 1;

        const remainingParticipants = [...this.stage.participants];

        let roundIterator = amountRounds / 2 - 1;
        while (remainingParticipants.length > 0) {
            const lastRound = remainingParticipants.length < gamesThisRound;
            for (let j = 0; j < gamesThisRound; j++) {
                games.push({
                    tournamentId: this.stage.tournamentId,
                    stageNumber: this.stage.stageNumber,
                    matchNumber: matchNumber,
                    groupNumber: roundIterator * 2 + 1,
                    participantIds: [
                        remainingParticipants.pop()?.participantId ?? "BYE",
                        lastRound ? "BYE" : null,
                    ],
                    precessorGames: [null, matchNumber - gamesThisRound],
                    templateParticipantNames: [
                        "",
                        `Winner of match ${matchNumber - gamesThisRound}`,
                    ],
                    participants: 2,
                });
                matchNumber--;
            }

            if (!lastRound) {
                for (let j = 0; j < gamesThisRound; j++) {
                    games.push({
                        tournamentId: this.stage.tournamentId,
                        stageNumber: this.stage.stageNumber,
                        matchNumber: matchNumber,
                        groupNumber: roundIterator * 2,
                        participantIds: [null, null],
                        precessorGames: [
                            matchNumber - j - gamesThisRound,
                            matchNumber - j - gamesThisRound - 1,
                        ],
                        templateParticipantNames: [
                            `Winner of match ${matchNumber - j - gamesThisRound}`,
                            `Winner of match ${matchNumber - j - gamesThisRound - 1}`,
                        ],
                        participants: 2,
                    });
                    matchNumber--;
                }
            }

            roundIterator--;
            gamesThisRound *= 2;
        }
        return LowerEliminationBracketStageType.renumberMatches(
            LowerEliminationBracketStageType.cleanUpByes(games.toReversed()),
        );
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
            ...LowerEliminationBracketStageType.reverseGenerateHalfs(
                upperHalf.toReversed(),
            ),
            ...LowerEliminationBracketStageType.reverseGenerateHalfs(
                lowerHalf.toReversed(),
            ),
        ];
    }

    private static cleanUpByes(matches: IStageGame[]): IStageGame[] {
        const byedMatches = new Map<number, string>();
        const resultingMatches: IStageGame[] = [];

        for (const match of matches) {
            for (let i = 0; i < match.precessorGames.length; i++) {
                if (
                    match.precessorGames[i] != null &&
                    byedMatches.has(match.precessorGames[i]!)
                ) {
                    match.participantIds[i] = byedMatches.get(
                        match.precessorGames[i]!,
                    )!;
                }
            }

            if (match.participantIds[0] === "BYE") {
                byedMatches.set(match.matchNumber, match.participantIds[1]!);
            } else if (match.participantIds[1] === "BYE") {
                byedMatches.set(match.matchNumber, match.participantIds[0]!);
            } else {
                resultingMatches.push(match);
            }
        }
        return resultingMatches;
    }

    private static renumberMatches(matches: IStageGame[]): IStageGame[] {
        const numberConversionMap = new Map<number, number>();
        for (let i = 1; i <= matches.length; i++) {
            numberConversionMap.set(matches[i - 1].matchNumber, i);
            matches[i - 1].matchNumber = i;
            matches[i - 1].precessorGames = matches[i - 1].precessorGames.map(
                (match) =>
                    match == null ? null : numberConversionMap.get(match)!,
            );
        }
        return matches;
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
