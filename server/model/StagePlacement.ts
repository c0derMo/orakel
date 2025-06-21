export abstract class StagePlacement {
    abstract toString(): string;
}

export class WinnerOf extends StagePlacement {
    private readonly matchId: number;

    constructor(matchId: number) {
        super();
        this.matchId = matchId;
    }

    toString(): string {
        return `Winner of ${this.matchId}`;
    }
}

export class LoserOf extends StagePlacement {
    private readonly matchId: number;

    constructor(matchId: number) {
        super();
        this.matchId = matchId;
    }

    toString(): string {
        return `Loser of ${this.matchId}`;
    }
}
