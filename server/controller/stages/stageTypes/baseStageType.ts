import { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import { IStageGame, IStageGameGroup } from "@shared/interfaces/IStageGame";
import { ITournament } from "@shared/interfaces/ITournament";

export class StageType {
    public static readonly name: string;
    public static readonly publicName: string;

    protected readonly stage: ITournamentStage;
    protected readonly tournament: ITournament;

    constructor(stage: ITournamentStage, tournament: ITournament) {
        this.stage = stage;
        this.tournament = tournament;
    }

    getGameGroups(): IStageGameGroup[] {
        return [];
    }

    getGames(): IStageGame[] {
        return [];
    }
}
