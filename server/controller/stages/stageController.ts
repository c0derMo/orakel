import { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import { TournamentStage } from "../../model/TournamentStage";
import consola from "consola";
import { DatabaseListener } from "../databaseListener";
import { EnrollmentConfig } from "./enrollmentConfigs/baseEnrollmentConfig";
import { AllParticipantsEnrollmentConfig } from "./enrollmentConfigs/allParticipants";
import { StageType } from "./stageTypes/baseStageType";
import { EliminationBracketStageType } from "./stageTypes/eliminationBracket";

const logger = consola.withTag("StageController");

export class StageController {
    private enrollmentConfigs: Map<string, EnrollmentConfig>;
    private stageTypes: Map<string, StageType>;

    constructor(listener: DatabaseListener) {
        this.enrollmentConfigs = new Map();
        this.stageTypes = new Map();

        this.addEventListeners(listener);

        this.addEnrollmentConfig(new AllParticipantsEnrollmentConfig());

        this.addStageType(new EliminationBracketStageType());
    }

    addEnrollmentConfig(config: EnrollmentConfig) {
        if (this.enrollmentConfigs.has(config.name)) {
            throw new Error(`EnrollmentConfig ${config.name} already exists`);
        }
        this.enrollmentConfigs.set(config.name, config);
    }

    getEnrollmentConfig(name: string): EnrollmentConfig {
        const config = this.enrollmentConfigs.get(name);
        if (config == null) {
            throw new Error(`No EnrollmentConfig ${name}`);
        }
        return config;
    }

    addStageType(type: StageType) {
        if (this.stageTypes.has(type.name)) {
            throw new Error(`StageType ${type.name} already exists`);
        }
        this.stageTypes.set(type.name, type);
    }

    getStageType(name: string): StageType {
        const stageType = this.stageTypes.get(name);
        if (stageType == null) {
            throw new Error(`No StageType ${name}`);
        }
        return stageType;
    }

    private async getStagesOfTournament(
        tournamentId: string,
    ): Promise<ITournamentStage[]> {
        return await TournamentStage.find({
            where: {
                tournamentId: tournamentId,
            },
        });
    }

    private async callForEachStage(
        tournamentId: string,
        callback: (stage: ITournamentStage, config: EnrollmentConfig) => void,
    ) {
        const stages = await this.getStagesOfTournament(tournamentId);
        for (const stage of stages) {
            const enrollmentConfig = this.getEnrollmentConfig(
                stage.enrollmentConfig.enrollmentType,
            );
            callback(stage, enrollmentConfig);
        }
    }

    private addEventListeners(listener: DatabaseListener) {
        listener.tournament.on("updated", async (tournament) => {
            await this.callForEachStage(tournament.id, (stage, config) =>
                config.emit("tournamentUpdated", stage, tournament),
            );
        });
        listener.tournamentParticipant.on("inserted", async (participant) => {
            await this.callForEachStage(
                participant.tournamentId,
                (stage, config) =>
                    config.emit(
                        "tournamentParticipantInserted",
                        stage,
                        participant,
                    ),
            );
        });
        listener.tournamentParticipant.on("updated", async (participant) => {
            await this.callForEachStage(
                participant.tournamentId,
                (stage, config) =>
                    config.emit(
                        "tournamentParticipantUpdated",
                        stage,
                        participant,
                    ),
            );
        });
        listener.tournamentParticipant.on("removed", async (participant) => {
            await this.callForEachStage(
                participant.tournamentId,
                (stage, config) =>
                    config.emit(
                        "tournamentParticipantRemoved",
                        stage,
                        participant,
                    ),
            );
        });
        listener.tournamentStage.on("inserted", async (stage) => {
            await this.callForEachStage(
                stage.tournamentId,
                (targetStage, config) =>
                    config.emit("tournamentStageInserted", stage, targetStage),
            );
        });
        listener.tournamentStage.on("updated", async (stage) => {
            await this.callForEachStage(
                stage.tournamentId,
                (targetStage, config) =>
                    config.emit("tournamentStageUpdated", stage, targetStage),
            );
        });
        listener.tournamentStage.on("removed", async (stage) => {
            await this.callForEachStage(
                stage.tournamentId,
                (targetStage, config) =>
                    config.emit("tournamentStageRemoved", stage, targetStage),
            );
        });
        listener.stageParticipant.on("inserted", async (participant) => {
            await this.callForEachStage(
                participant.tournamentId,
                (stage, config) =>
                    config.emit("stageParticipantInserted", stage, participant),
            );
        });
        listener.stageParticipant.on("updated", async (participant) => {
            await this.callForEachStage(
                participant.tournamentId,
                (stage, config) =>
                    config.emit("stageParticipantUpdated", stage, participant),
            );
        });
        listener.stageParticipant.on("removed", async (participant) => {
            await this.callForEachStage(
                participant.tournamentId,
                (stage, config) =>
                    config.emit("stageParticipantRemoved", stage, participant),
            );
        });
    }
}
