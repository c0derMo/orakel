import type { IStageGame } from "@shared/interfaces/IStageGame";

export abstract class StagePlacement {
    abstract toString(): string;
    abstract resolve(matches: IStageGame[]): void;
}

export class WinnerOf extends StagePlacement {
    private readonly matchId: number;
    private resolvedPlayer: string | null;

    constructor(matchId: number) {
        super();
        this.matchId = matchId;
        this.resolvedPlayer = null;
    }

    toString(): string {
        if (this.resolvedPlayer != null) {
            return this.resolvedPlayer;
        } else {
            return `Winner of ${this.matchId}`;
        }
    }

    resolve(matches: IStageGame[]) {
        const match = matches.find(
            (match) => match.matchNumber === this.matchId,
        );
        if (match?.result == null) {
            return;
        }
        this.resolvedPlayer = match.participantIds[match.result.ranking[0]];
    }
}

export class LoserOf extends StagePlacement {
    private readonly matchId: number;
    private resolvedPlayer: string | null;

    constructor(matchId: number) {
        super();
        this.matchId = matchId;
        this.resolvedPlayer = null;
    }

    toString(): string {
        if (this.resolvedPlayer != null) {
            return this.resolvedPlayer;
        } else {
            return `Loser of ${this.matchId}`;
        }
    }

    resolve(matches: IStageGame[]) {
        const match = matches.find(
            (match) => match.matchNumber === this.matchId,
        );
        if (match?.result == null) {
            return;
        }
        this.resolvedPlayer =
            match.participantIds[
                match.result.ranking[match.result.ranking.length - 1]
            ];
    }
}
