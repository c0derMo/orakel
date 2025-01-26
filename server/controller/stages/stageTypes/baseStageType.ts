import { TournamentStage } from "../../../model/TournamentStage";
import { IStageGame, IStageGameGroup } from "@shared/interfaces/IStageGame";

export abstract class StageType {
    readonly name: string;
    readonly publicName: string;

    constructor(name: string, publicName: string) {
        this.name = name;
        this.publicName = publicName;
    }

    abstract getGameGroups(stage: TournamentStage): IStageGameGroup[];
    abstract getGames(stage: TournamentStage): IStageGame[];
}
