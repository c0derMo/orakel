import type {
    IStageParticipant,
    ITournamentStage,
} from "@shared/interfaces/ITournamentStage";
import type { IGameReport } from "@shared/interfaces/IStageGame";
import type { TournamentStage } from "model/TournamentStage";
import type { StagePlacement } from "model/StagePlacement";
import type { StageController } from "../stageController";
import { StageMatch } from "model/StageMatch";

export class StageType {
    public static readonly name: string;
    public static readonly publicName: string;

    protected readonly stage: TournamentStage;
    protected readonly controller: StageController;

    constructor(stage: TournamentStage, controller: StageController) {
        this.stage = stage;
        this.controller = controller;
    }

    public onTournamentUpdated(): Promise<void> | void {
        return;
    }

    public onTournamentStageInserted(
        stage: ITournamentStage,
    ): Promise<void> | void {
        void stage;
    }

    public onTournamentStageUpdated(
        stage: ITournamentStage,
    ): Promise<void> | void {
        void stage;
    }

    public onTournamentStageRemoved(
        stage: ITournamentStage,
    ): Promise<void> | void {
        void stage;
    }

    public onStageParticipantInserted(
        participant: IStageParticipant,
    ): Promise<void> | void {
        void participant;
    }

    public onStageParticipantUpdated(
        participant: IStageParticipant,
    ): Promise<void> | void {
        void participant;
    }

    public onStageParticipantRemoved(
        participant: IStageParticipant,
    ): Promise<void> | void {
        void participant;
    }

    public onGameReportInserted(report: IGameReport): Promise<void> | void {
        void report;
    }

    public onGameReportUpdated(report: IGameReport): Promise<void> | void {
        void report;
    }

    public onGameReportRemoved(report: IGameReport): Promise<void> | void {
        void report;
    }

    public initialize(): Promise<void> | void {
        return;
    }

    public getPlacements(): StagePlacement[] {
        return [];
    }

    public async getResolvedPlacements(): Promise<StagePlacement[]> {
        const matches = await StageMatch.find({
            where: {
                tournamentId: this.stage.tournamentId,
                stageNumber: this.stage.stageNumber,
            },
            relations: {
                result: true,
            },
        });
        const placements = this.getPlacements();
        placements.forEach((placement) => placement.resolve(matches));
        return placements;
    }
}
