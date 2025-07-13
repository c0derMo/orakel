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

        const amountParticipants = Array(this.stage.participants.length)
            .fill(0)
            .map((_, idx) => idx);
        const dropIns = LowerEliminationBracketStageType.reverseRounds(
            LowerEliminationBracketStageType.reverseGenerateDropIns(
                amountParticipants,
            ),
        );
        const reversedParticipants = [...this.stage.participants];

        let roundIterator = -1;
        let matchNumber = 1;
        for (const droppedInThisRound of dropIns) {
            for (const player of droppedInThisRound) {
                games.push({
                    tournamentId: this.stage.tournamentId,
                    stageNumber: this.stage.stageNumber,
                    matchNumber: matchNumber,
                    groupNumber: roundIterator,
                    participantIds: [
                        player >= 0
                            ? reversedParticipants[player].participantId
                            : "BYE",
                        roundIterator == -1 ? "BYE" : null,
                    ],
                    precessorGames: [
                        null,
                        matchNumber - droppedInThisRound.length,
                    ],
                    templateParticipantNames: [
                        "",
                        `Winner of match ${this.stage.stageNumber}.${matchNumber - droppedInThisRound.length}`,
                    ],
                    participants: 2,
                });
                matchNumber++;
            }
            roundIterator++;

            if (droppedInThisRound.length > 1) {
                for (let j = 0; j < droppedInThisRound.length / 2; j++) {
                    games.push({
                        tournamentId: this.stage.tournamentId,
                        stageNumber: this.stage.stageNumber,
                        matchNumber: matchNumber,
                        groupNumber: roundIterator,
                        participantIds: [null, null],
                        precessorGames: [
                            matchNumber + j - droppedInThisRound.length,
                            matchNumber + j - droppedInThisRound.length + 1,
                        ],
                        templateParticipantNames: [
                            `Winner of match ${this.stage.stageNumber}.${matchNumber + j - droppedInThisRound.length}`,
                            `Winner of match ${this.stage.stageNumber}.${matchNumber + j - droppedInThisRound.length + 1}`,
                        ],
                        participants: 2,
                    });
                    matchNumber++;
                }
                roundIterator++;
            }
        }

        return this.renumberMatches(
            LowerEliminationBracketStageType.cleanUpByes(games),
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

    public static reverseRounds(dropIns: number[][]): number[][] {
        for (let i = 1; i < dropIns.length; i++) {
            switch (i % 4) {
                case 0:
                    dropIns[i].sort((a, b) => a - b);
                    break;
                case 1:
                    dropIns[i].sort((a, b) => b - a);
                    break;
                case 2:
                    dropIns[i].sort((a, b) => b - a);
                    dropIns[i] = [
                        ...dropIns[i].slice(dropIns[i].length / 2),
                        ...dropIns[i].slice(0, dropIns[i].length / 2),
                    ];
                    break;
                case 3:
                    dropIns[i].sort((a, b) => a - b);
                    dropIns[i] = [
                        ...dropIns[i].slice(dropIns[i].length / 2),
                        ...dropIns[i].slice(0, dropIns[i].length / 2),
                    ];
                    break;
            }
        }
        return dropIns;
    }

    public static reverseGenerateDropIns(
        participants: number[],
        placementsThisRound = 1,
    ): number[][] {
        if (participants.length > placementsThisRound) {
            const thisRound = participants.splice(
                participants.length - placementsThisRound,
                placementsThisRound,
            );

            return [
                ...this.reverseGenerateDropIns(
                    participants,
                    placementsThisRound * 2,
                ),
                thisRound,
            ];
        } else {
            const allNumbers = Array(placementsThisRound)
                .fill(0)
                .map((_, idx) => idx);
            const wbr1Matches =
                LowerEliminationBracketStageType.reverseGenerateHalfs(
                    allNumbers,
                );

            const flattenedPlayers = wbr1Matches.flat();
            const amountByes = placementsThisRound - participants.length;

            const result = [];
            let offset = 0;
            for (let idx = 0; idx < placementsThisRound; idx++) {
                if (flattenedPlayers[idx] < amountByes) {
                    result.push(-1);
                    offset++;
                } else {
                    result.push(idx - offset);
                }
            }

            return [result];
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

    private renumberMatches(matches: IStageGame[]): IStageGame[] {
        const numberConversionMap = new Map<number, number>();
        for (let i = 1; i <= matches.length; i++) {
            numberConversionMap.set(matches[i - 1].matchNumber, i);
            matches[i - 1].matchNumber = i;
            matches[i - 1].precessorGames = matches[i - 1].precessorGames.map(
                (match, idx) => {
                    if (match == null) {
                        return null;
                    } else {
                        const newNumber = numberConversionMap.get(match)!;
                        matches[i - 1].templateParticipantNames[idx] =
                            `Winner of match ${this.stage.stageNumber}.${newNumber}`;
                        return newNumber;
                    }
                },
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
