import { TournamentStage } from "model/TournamentStage";
import { EnrollmentConfig } from "./baseEnrollmentConfig";
import type { StagePlacement } from "model/StagePlacement";
import { StageParticipant } from "model/StageParticipant";
import type { IStageParticipant } from "@shared/interfaces/ITournamentStage";
import type { IGameReport } from "@shared/interfaces/IStageGame";

export class LosersOfStageEnrollmentConfig extends EnrollmentConfig {
    static readonly name = "losers_of_stage";
    static readonly publicName = "Losers of stage";

    public async initialize(): Promise<void> {
        await this.updateParticipants();
    }

    public async onStageParticipantInserted(
        participant: IStageParticipant,
    ): Promise<void> {
        if (participant.stageNumber == this.getPreceedingStageNumber()) {
            await this.updateParticipants();
        }
    }

    public async onStageParticipantUpdated(
        participant: IStageParticipant,
    ): Promise<void> {
        if (participant.stageNumber == this.getPreceedingStageNumber()) {
            await this.updateParticipants();
        }
    }

    public async onStageParticipantRemoved(
        participant: IStageParticipant,
    ): Promise<void> {
        if (participant.stageNumber == this.getPreceedingStageNumber()) {
            await this.updateParticipants();
        }
    }

    public async onMatchReportInserted(report: IGameReport): Promise<void> {
        if (report.stageNumber == this.getPreceedingStageNumber()) {
            await this.updateParticipants();
        }
    }

    public async onMatchReportUpdated(report: IGameReport): Promise<void> {
        if (report.stageNumber == this.getPreceedingStageNumber()) {
            await this.updateParticipants();
        }
    }

    public async onMatchReportRemoved(report: IGameReport): Promise<void> {
        if (report.stageNumber == this.getPreceedingStageNumber()) {
            await this.updateParticipants();
        }
    }

    private async updateParticipants() {
        const placements = await this.getRankingsOfPreceedingStage();
        const takingPlacements = placements.slice(0, -1);
        for (let i = 0; i < takingPlacements.length; i++) {
            await this.updateOrReplaceDummy(takingPlacements[i], i);
        }
    }

    private async updateOrReplaceDummy(
        placement: StagePlacement,
        index: number,
    ) {
        let dummy = await StageParticipant.findOneBy({
            tournamentId: this.stage.tournamentId,
            stageNumber: this.stage.stageNumber,
            participantId: `dummy_${index}`,
        });
        if (dummy == null) {
            dummy = new StageParticipant();
            dummy.tournamentId = this.stage.tournamentId;
            dummy.stageNumber = this.stage.stageNumber;
            dummy.participantId = `dummy_${index}`;
            dummy.additionalInfo = {};
        }

        if (placement.isResolved()) {
            dummy.participantId = placement.toString();
            dummy.dummyName = null;
        } else {
            dummy.dummyName = placement.toString();
        }
        await dummy.save();
    }

    private getPreceedingStageNumber(): number {
        return this.stage.stageNumber - 1;
    }

    private async getPreceedingStage(): Promise<TournamentStage> {
        return await TournamentStage.findOneOrFail({
            where: {
                tournamentId: this.stage.tournamentId,
                stageNumber: this.getPreceedingStageNumber(),
            },
            relations: {
                participants: true,
                matches: true,
            },
        });
    }

    private async getRankingsOfPreceedingStage(): Promise<StagePlacement[]> {
        const stage = await this.getPreceedingStage();
        const stageType = this.controller.getStageType(stage);
        return stageType.getResolvedPlacements();
    }
}
