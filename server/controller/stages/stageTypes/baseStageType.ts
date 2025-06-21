import type {
    IStageParticipant,
    ITournamentStage,
} from "@shared/interfaces/ITournamentStage";
import type { IGameReport } from "@shared/interfaces/IStageGame";
import type { ITournament } from "@shared/interfaces/ITournament";
import type { TournamentStage } from "model/TournamentStage";
import type { StagePlacement } from "model/StagePlacement";

export class StageType {
    public static readonly name: string;
    public static readonly publicName: string;

    protected readonly stage: TournamentStage;
    protected readonly tournament: ITournament;

    constructor(stage: TournamentStage, tournament: ITournament) {
        this.stage = stage;
        this.tournament = tournament;
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
}
