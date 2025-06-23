import type { ITournamentParticipant } from "@shared/interfaces/ITournament";
import type {
    IStageParticipant,
    ITournamentStage,
} from "@shared/interfaces/ITournamentStage";
import { StageParticipant } from "../../../model/StageParticipant";
import type { StageController } from "../stageController";
import type { TournamentStage } from "model/TournamentStage";
import type { IGameReport } from "@shared/interfaces/IStageGame";

export class EnrollmentConfig {
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

    public onTournamentParticipantInserted(
        tournamentParticipant: ITournamentParticipant,
    ): Promise<void> | void {
        void tournamentParticipant;
    }

    public onTournamentParticipantUpdated(
        tournamentParticipant: ITournamentParticipant,
    ): Promise<void> | void {
        void tournamentParticipant;
    }

    public onTournamentParticipantRemoved(
        tournamentParticipant: ITournamentParticipant,
    ): Promise<void> | void {
        void tournamentParticipant;
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

    public onMatchReportInserted(report: IGameReport): Promise<void> | void {
        void report;
    }

    public onMatchReportUpdated(report: IGameReport): Promise<void> | void {
        void report;
    }

    public onMatchReportRemoved(report: IGameReport): Promise<void> | void {
        void report;
    }

    public initialize(): Promise<void> | void {
        return;
    }

    protected async addToStage(
        participant: ITournamentParticipant,
        additionalData?: Record<string, unknown>,
    ): Promise<void> {
        const stageParticipant = StageParticipant.create({
            tournamentId: this.stage.tournamentId,
            stageNumber: this.stage.stageNumber,
            participantId: participant.participantId,
            additionalInfo: additionalData ?? {},
        });
        await stageParticipant.save();
    }

    protected async removeFromStage(
        participant: ITournamentParticipant,
    ): Promise<void> {
        await StageParticipant.delete({
            tournamentId: this.stage.tournamentId,
            stageNumber: this.stage.stageNumber,
            participantId: participant.participantId,
        });
    }
}
