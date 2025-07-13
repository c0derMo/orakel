import { TournamentStage } from "../../model/TournamentStage";
import { consola } from "consola";
import { DatabaseListener } from "../databaseListener";
import { EnrollmentConfig } from "./enrollmentConfigs/baseEnrollmentConfig";
import { AllParticipantsEnrollmentConfig } from "./enrollmentConfigs/allParticipants";
import { StageType } from "./stageTypes/baseStageType";
import { EliminationBracketStageType } from "./stageTypes/eliminationBracket";
import { Tournament } from "../../model/Tournament";
import { StageParticipant } from "../../model/StageParticipant";
import { StageMatch } from "model/StageMatch";
import { GameReport } from "model/GameReport";
import { LosersOfStageEnrollmentConfig } from "./enrollmentConfigs/losersOfStage";
import { LowerEliminationBracketStageType } from "./stageTypes/lowerEliminationBracket";

const logger = consola.withTag("StageController");

export class StageController {
    private readonly enrollmentConfigs: Map<string, typeof EnrollmentConfig>;
    private readonly stageTypes: Map<string, typeof StageType>;
    private readonly updateQueue: Map<string, (() => void | Promise<void>)[]>;

    constructor(listener: DatabaseListener) {
        this.enrollmentConfigs = new Map();
        this.stageTypes = new Map();
        this.updateQueue = new Map();

        this.addEventListeners(listener);

        this.addEnrollmentConfig(AllParticipantsEnrollmentConfig);
        this.addEnrollmentConfig(LosersOfStageEnrollmentConfig);

        this.addStageType(EliminationBracketStageType);
        this.addStageType(LowerEliminationBracketStageType);
    }

    addEnrollmentConfig(config: typeof EnrollmentConfig) {
        if (this.enrollmentConfigs.has(config.name)) {
            throw new Error(`EnrollmentConfig ${config.name} already exists`);
        }
        logger.debug(
            `EnrollmentConfig ${config.name} (${config.publicName}) registered`,
        );
        this.enrollmentConfigs.set(config.name, config);
    }

    getEnrollmentConfig(stage: TournamentStage): EnrollmentConfig {
        const Config = this.enrollmentConfigs.get(stage.enrollmentType);
        if (Config == null) {
            throw new Error(`No EnrollmentConfig ${stage.enrollmentType}`);
        }
        return new Config(stage, this);
    }

    addStageType(type: typeof StageType) {
        if (this.stageTypes.has(type.name)) {
            throw new Error(`StageType ${type.name} already exists`);
        }
        logger.debug(`StageType ${type.name} (${type.publicName}) registered`);
        this.stageTypes.set(type.name, type);
    }

    getStageType(stage: TournamentStage): StageType {
        const StageType = this.stageTypes.get(stage.stageType);
        if (StageType == null) {
            throw new Error(`No StageType ${stage.stageType}`);
        }
        return new StageType(stage, this);
    }

    private async getStagesOfTournament(
        tournamentId: string,
    ): Promise<TournamentStage[]> {
        return await TournamentStage.find({
            where: {
                tournamentId: tournamentId,
            },
            relations: {
                participants: true,
                tournament: true,
                matches: true,
            },
        });
    }

    getStageTypes(): Record<string, string> {
        const result: Record<string, string> = {};
        for (const [key, value] of this.stageTypes.entries()) {
            result[key] = value.publicName;
        }
        return result;
    }

    getEnrollmentConfigs(): Record<string, string> {
        const result: Record<string, string> = {};
        for (const [key, value] of this.enrollmentConfigs.entries()) {
            result[key] = value.publicName;
        }
        return result;
    }

    private async initializeEnrollmentConfig(
        stage: TournamentStage,
    ): Promise<void> {
        const tournament = await Tournament.findOne({
            where: {
                id: stage.tournamentId,
            },
            relations: {
                participants: true,
            },
        });
        if (tournament == null) {
            return;
        }

        await StageParticipant.delete({
            tournamentId: stage.tournamentId,
            stageNumber: stage.stageNumber,
        });

        await this.getEnrollmentConfig(stage).initialize();
    }

    private async initializeStageType(stage: TournamentStage): Promise<void> {
        const tournament = await Tournament.findOneBy({
            id: stage.tournamentId,
        });
        if (tournament == null) {
            return;
        }

        await GameReport.delete({
            tournamentId: stage.tournamentId,
            stageNumber: stage.stageNumber,
        });
        await StageMatch.delete({
            tournamentId: stage.tournamentId,
            stageNumber: stage.stageNumber,
        });

        const postLoadedStage = await TournamentStage.findOne({
            where: {
                tournamentId: stage.tournamentId,
                stageNumber: stage.stageNumber,
            },
            relations: {
                tournament: true,
                participants: true,
                matches: true,
            },
        });

        await this.getStageType(postLoadedStage ?? stage).initialize();
    }

    private enqueueUpdate(
        tournamentId: string,
        callback: () => void | Promise<void>,
    ) {
        if (this.updateQueue.has(tournamentId)) {
            this.updateQueue.get(tournamentId)!.push(callback);
            return;
        }

        this.updateQueue.set(tournamentId, [callback]);
        void this.workQueue(tournamentId);
    }

    private async workQueue(tournamentId: string): Promise<void> {
        const queue = this.updateQueue.get(tournamentId);
        if (queue == null || queue.length <= 0) {
            this.updateQueue.delete(tournamentId);
            return;
        }

        const nextCallback = queue.splice(0, 1)[0];
        await nextCallback();
        return this.workQueue(tournamentId);
    }

    private async callForEachStage(
        tournamentId: string,
        callback: (
            config: EnrollmentConfig,
            type: StageType,
        ) => Promise<void> | void,
    ) {
        const stages = await this.getStagesOfTournament(tournamentId);
        for (const stage of stages) {
            const enrollmentConfig = this.getEnrollmentConfig(stage);
            const stageType = this.getStageType(stage);
            await callback(enrollmentConfig, stageType);
        }
    }

    private addEventListeners(listener: DatabaseListener) {
        listener.tournament.on("updated", (tournament) => {
            if (tournament == null) return;
            this.enqueueUpdate(tournament.id, () =>
                this.callForEachStage(tournament.id, async (config, type) => {
                    await config.onTournamentUpdated();
                    await type.onTournamentUpdated();
                }),
            );
        });
        listener.tournamentParticipant.on("inserted", (participant) => {
            if (participant == null) return;
            this.enqueueUpdate(participant.tournamentId, () =>
                this.callForEachStage(
                    participant.tournamentId,
                    async (config) => {
                        await config.onTournamentParticipantInserted(
                            participant,
                        );
                    },
                ),
            );
        });
        listener.tournamentParticipant.on("updated", (participant) => {
            if (participant == null) return;
            this.enqueueUpdate(participant.tournamentId, () =>
                this.callForEachStage(
                    participant.tournamentId,
                    async (config) => {
                        await config.onTournamentParticipantUpdated(
                            participant,
                        );
                    },
                ),
            );
        });
        listener.tournamentParticipant.on("removed", (participant) => {
            if (participant == null) return;
            this.enqueueUpdate(participant.tournamentId, () =>
                this.callForEachStage(
                    participant.tournamentId,
                    async (config) => {
                        await config.onTournamentParticipantRemoved(
                            participant,
                        );
                    },
                ),
            );
        });
        listener.tournamentStage.on("inserted", (stage) => {
            if (stage == null) return;

            this.enqueueUpdate(stage.tournamentId, async () => {
                await this.initializeEnrollmentConfig(stage);
            });
            this.enqueueUpdate(stage.tournamentId, async () => {
                await this.initializeStageType(stage);
            });
            this.enqueueUpdate(stage.tournamentId, () =>
                this.callForEachStage(
                    stage.tournamentId,
                    async (config, type) => {
                        await config.onTournamentStageInserted(stage);
                        await type.onTournamentStageInserted(stage);
                    },
                ),
            );
        });
        listener.tournamentStage.on("updated", (stage, changedColumns) => {
            if (stage == null) return;

            if (changedColumns?.includes("enrollmentType")) {
                this.enqueueUpdate(stage.tournamentId, async () => {
                    await this.initializeEnrollmentConfig(stage);
                });
                this.enqueueUpdate(stage.tournamentId, async () => {
                    await this.initializeStageType(stage);
                });
            } else if (changedColumns?.includes("stageType")) {
                this.enqueueUpdate(stage.tournamentId, async () => {
                    await this.initializeStageType(stage);
                });
            }

            this.enqueueUpdate(stage.tournamentId, () =>
                this.callForEachStage(
                    stage.tournamentId,
                    async (config, type) => {
                        await config.onTournamentStageUpdated(stage);
                        await type.onTournamentStageUpdated(stage);
                    },
                ),
            );
        });
        listener.tournamentStage.on("removed", (stage) => {
            if (stage == null) return;
            this.enqueueUpdate(stage.tournamentId, () =>
                this.callForEachStage(
                    stage.tournamentId,
                    async (config, type) => {
                        await config.onTournamentStageRemoved(stage);
                        await type.onTournamentStageRemoved(stage);
                    },
                ),
            );
        });
        listener.stageParticipant.on("inserted", (participant) => {
            if (participant == null) return;
            this.enqueueUpdate(participant.tournamentId, () =>
                this.callForEachStage(
                    participant.tournamentId,
                    async (config, type) => {
                        await config.onStageParticipantInserted(participant);
                        await type.onStageParticipantInserted(participant);
                    },
                ),
            );
        });
        listener.stageParticipant.on("updated", (participant) => {
            if (participant == null) return;
            this.enqueueUpdate(participant.tournamentId, () =>
                this.callForEachStage(
                    participant.tournamentId,
                    async (config, type) => {
                        await config.onStageParticipantUpdated(participant);
                        await type.onStageParticipantUpdated(participant);
                    },
                ),
            );
        });
        listener.stageParticipant.on("removed", (participant) => {
            if (participant == null) return;
            this.enqueueUpdate(participant.tournamentId, () =>
                this.callForEachStage(
                    participant.tournamentId,
                    async (config, type) => {
                        await config.onStageParticipantRemoved(participant);
                        await type.onStageParticipantRemoved(participant);
                    },
                ),
            );
        });
        listener.gameReport.on("inserted", (report) => {
            if (report == null) return;
            this.enqueueUpdate(report.tournamentId, () =>
                this.callForEachStage(
                    report.tournamentId,
                    async (config, type) => {
                        await config.onMatchReportInserted(report);
                        await type.onGameReportInserted(report);
                    },
                ),
            );
        });
        listener.gameReport.on("updated", (report) => {
            if (report == null) return;
            this.enqueueUpdate(report.tournamentId, () =>
                this.callForEachStage(
                    report.tournamentId,
                    async (config, type) => {
                        await config.onMatchReportUpdated(report);
                        await type.onGameReportUpdated(report);
                    },
                ),
            );
        });
        listener.gameReport.on("removed", (report) => {
            if (report == null) return;
            this.enqueueUpdate(report.tournamentId, () =>
                this.callForEachStage(
                    report.tournamentId,
                    async (config, type) => {
                        await config.onMatchReportRemoved(report);
                        await type.onGameReportRemoved(report);
                    },
                ),
            );
        });
    }
}
