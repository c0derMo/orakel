import type { IStageGame } from "@shared/interfaces/IStageGame";

export abstract class StagePlacement {
    private _isResolved: boolean;
    abstract toString(): string;

    protected _resolve(matches: IStageGame[]): boolean {
        void matches;
        return false;
    }

    public resolve(matches: IStageGame[]) {
        const success = this._resolve(matches);
        this._isResolved = success;
    }

    public isResolved(): boolean {
        return this._isResolved;
    }
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

    _resolve(matches: IStageGame[]): boolean {
        const match = matches.find(
            (match) => match.matchNumber === this.matchId,
        );
        if (match?.result == null) {
            return false;
        }
        this.resolvedPlayer = match.participantIds[match.result.ranking[0]];
        return true;
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

    _resolve(matches: IStageGame[]): boolean {
        const match = matches.find(
            (match) => match.matchNumber === this.matchId,
        );
        if (match?.result == null) {
            return false;
        }
        this.resolvedPlayer =
            match.participantIds[
                match.result.ranking[match.result.ranking.length - 1]
            ];
        return true;
    }
}
