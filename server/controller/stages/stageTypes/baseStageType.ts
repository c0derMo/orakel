import type { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import type {
    IStageGame,
    IStageGameGroup,
} from "@shared/interfaces/IStageGame";
import type { ITournament } from "@shared/interfaces/ITournament";
import type { StagePlacement } from "../../../model/StagePlacement";

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

    getPlacements(): StagePlacement[] {
        return [];
    }
}
