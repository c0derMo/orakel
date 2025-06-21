import type { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import { TournamentStage } from "../../model/TournamentStage";
import { consola } from "consola";
import { DatabaseListener } from "../databaseListener";
import { EnrollmentConfig } from "./enrollmentConfigs/baseEnrollmentConfig";
import { AllParticipantsEnrollmentConfig } from "./enrollmentConfigs/allParticipants";
import { StageType } from "./stageTypes/baseStageType";
import { EliminationBracketStageType } from "./stageTypes/eliminationBracket";
import type { ITournament } from "@shared/interfaces/ITournament";
import { Tournament } from "../../model/Tournament";
import { StageParticipant } from "../../model/StageParticipant";

const logger = consola.withTag("StageController");

export class StageController {
    private enrollmentConfigs: Map<string, typeof EnrollmentConfig>;
    private stageTypes: Map<string, typeof StageType>;

    constructor(listener: DatabaseListener) {
        this.enrollmentConfigs = new Map();
        this.stageTypes = new Map();

        this.addEventListeners(listener);

        this.addEnrollmentConfig(AllParticipantsEnrollmentConfig);

        this.addStageType(EliminationBracketStageType);
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

    getEnrollmentConfig(
        stage: ITournamentStage,
        tournament: ITournament,
    ): EnrollmentConfig {
        const Config = this.enrollmentConfigs.get(stage.enrollmentType);
        if (Config == null) {
            throw new Error(`No EnrollmentConfig ${stage.enrollmentType}`);
        }
        return new Config(stage, tournament);
    }

    addStageType(type: typeof StageType) {
        if (this.stageTypes.has(type.name)) {
            throw new Error(`StageType ${type.name} already exists`);
        }
        logger.debug(`StageType ${type.name} (${type.publicName}) registered`);
        this.stageTypes.set(type.name, type);
    }

    getStageType(stage: ITournamentStage, tournament: ITournament): StageType {
        const StageType = this.stageTypes.get(stage.stageType);
        if (StageType == null) {
            throw new Error(`No StageType ${stage.stageType}`);
        }
        return new StageType(stage, tournament);
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
        const tournament = await Tournament.findOneBy({
            id: stage.tournamentId,
        });
        if (tournament == null) {
            return;
        }

        await StageParticipant.delete({
            tournamentId: stage.tournamentId,
            stageNumber: stage.stageNumber,
        });

        await this.getEnrollmentConfig(stage, tournament).initialize();
    }

    private async callForEachStage(
        tournamentId: string,
        callback: (config: EnrollmentConfig) => void,
    ) {
        const tournament = await Tournament.findOneOrFail({
            where: {
                id: tournamentId,
            },
            relations: {
                participants: true,
            },
        });
        const stages = await this.getStagesOfTournament(tournamentId);
        for (const stage of stages) {
            const enrollmentConfig = this.getEnrollmentConfig(
                stage,
                tournament,
            );
            callback(enrollmentConfig);
        }
    }

    private addEventListeners(listener: DatabaseListener) {
        listener.tournament.on("updated", (tournament) => {
            if (tournament == null) return;
            void this.callForEachStage(
                tournament.id,
                (config) => void config.tournamentUpdated(),
            );
        });
        listener.tournamentParticipant.on("inserted", (participant) => {
            if (participant == null) return;
            void this.callForEachStage(
                participant.tournamentId,
                (config) =>
                    void config.onTournamentParticipantInserted(participant),
            );
        });
        listener.tournamentParticipant.on("updated", (participant) => {
            if (participant == null) return;
            void this.callForEachStage(
                participant.tournamentId,
                (config) =>
                    void config.onTournamentParticipantUpdated(participant),
            );
        });
        listener.tournamentParticipant.on("removed", (participant) => {
            if (participant == null) return;
            void this.callForEachStage(
                participant.tournamentId,
                (config) =>
                    void config.onTournamentParticipantRemoved(participant),
            );
        });
        listener.tournamentStage.on("inserted", (stage) => {
            if (stage == null) return;
            void this.callForEachStage(
                stage.tournamentId,
                (config) => void config.onTournamentStageInserted(stage),
            );
        });
        listener.tournamentStage.on("updated", (stage, changedColumns) => {
            if (stage == null) return;

            let initializer = Promise.resolve();
            if (changedColumns?.includes("enrollmentType")) {
                initializer = this.initializeEnrollmentConfig(stage);
            }

            void initializer.then(() => {
                console.log("Post initializer?");
                void this.callForEachStage(
                    stage.tournamentId,
                    (config) => void config.onTournamentStageUpdated(stage),
                );
            });
        });
        listener.tournamentStage.on("removed", (stage) => {
            if (stage == null) return;
            void this.callForEachStage(
                stage.tournamentId,
                (config) => void config.onTournamentStageRemoved(stage),
            );
        });
        listener.stageParticipant.on("inserted", (participant) => {
            if (participant == null) return;
            void this.callForEachStage(
                participant.tournamentId,
                (config) => void config.onStageParticipantInserted(participant),
            );
        });
        listener.stageParticipant.on("updated", (participant) => {
            if (participant == null) return;
            void this.callForEachStage(
                participant.tournamentId,
                (config) => void config.onStageParticipantUpdated(participant),
            );
        });
        listener.stageParticipant.on("removed", (participant) => {
            if (participant == null) return;
            void this.callForEachStage(
                participant.tournamentId,
                (config) => void config.onStageParticipantRemoved(participant),
            );
        });
    }
}
