import { TournamentStage } from "../../../model/TournamentStage";
import { IStageGame, IStageGameGroup } from "@shared/interfaces/IStageGame";

export abstract class StageType {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    abstract getGameGroups(stage: TournamentStage): IStageGameGroup[];
    abstract getGames(stage: TournamentStage): IStageGame[];

}