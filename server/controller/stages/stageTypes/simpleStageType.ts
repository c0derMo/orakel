import type {
    IGameReport,
    IStageGame,
    IStageGameGroup,
} from "@shared/interfaces/IStageGame";
import { StageType } from "./baseStageType";
import { StageMatch } from "model/StageMatch";
import type { IStageParticipant } from "@shared/interfaces/ITournamentStage";
import { TournamentStage } from "model/TournamentStage";

export abstract class SimpleStageType extends StageType {
    abstract getGameGroups(): IStageGameGroup[];
    abstract getGames(): IStageGame[];

    resolveMatch(match: IStageGame, report: IGameReport): Promise<void> | void {
        void match;
        void report;
    }

    protected async update() {
        const groups = this.getGameGroups();
        const games = this.getGames();

        await TournamentStage.update(
            {
                tournamentId: this.stage.tournamentId,
                stageNumber: this.stage.stageNumber,
            },
            {
                groups: groups,
            },
        );

        for (const match of games) {
            await StageMatch.fromObject(match).save();
        }
    }

    public async onGameReportInserted(report: IGameReport): Promise<void> {
        if (report.stageNumber !== this.stage.stageNumber) {
            return;
        }
        const match = await StageMatch.findOneBy({
            tournamentId: report.tournamentId,
            stageNumber: report.stageNumber,
            matchNumber: report.matchNumber,
        });
        if (match == null) {
            return;
        }

        await this.resolveMatch(match, report);
    }

    public async onGameReportUpdated(report: IGameReport): Promise<void> {
        if (report.stageNumber !== this.stage.stageNumber) {
            return;
        }
        const match = await StageMatch.findOneBy({
            tournamentId: report.tournamentId,
            stageNumber: report.stageNumber,
            matchNumber: report.matchNumber,
        });
        if (match == null) {
            return;
        }

        await this.resolveMatch(match, report);
    }

    public async onGameReportRemoved(report: IGameReport): Promise<void> {
        if (report.stageNumber === this.stage.stageNumber) {
            await this.update();
        }
    }

    public async onStageParticipantInserted(
        participant: IStageParticipant,
    ): Promise<void> {
        if (participant.stageNumber === this.stage.stageNumber) {
            await this.update();
        }
    }

    public async onStageParticipantUpdated(
        participant: IStageParticipant,
    ): Promise<void> {
        if (participant.stageNumber === this.stage.stageNumber) {
            await this.update();
        }
    }

    public async onStageParticipantRemoved(
        participant: IStageParticipant,
    ): Promise<void> {
        if (participant.stageNumber === this.stage.stageNumber) {
            await this.update();
        }
    }

    public async initialize(): Promise<void> {
        await this.update();
    }
}
