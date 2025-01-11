import { ITournamentParticipant } from "@shared/interfaces/ITournament";
import { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import { EventEmitter } from "node:events";
import { TournamentStage } from "../../model/TournamentStage";
import { TournamentParticipant } from "../../model/TournamentParticipant";
import { StageParticipant } from "../../model/StageParticipant";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from "typeorm";
import consola from "consola";

const logger = consola.withTag("StageController");

interface EnrollmentConfigEvents {
    "participantAdded": [stage: ITournamentStage, participant: ITournamentParticipant];
    "participantRemoved": [stage: ITournamentStage, participant: ITournamentParticipant];
}

export class EnrollmentConfig extends EventEmitter<EnrollmentConfigEvents> {
    readonly name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    async addToStage(stage: ITournamentStage, participant: ITournamentParticipant, additionalData?: Record<string, unknown>): Promise<void> {
        const stageParticipant = StageParticipant.create({
            tournamentId: stage.tournamentId,
            stageNumber: stage.stageNumber,
            participantId: participant.participantId,
            additionalInfo: additionalData ?? {}
        });
        await stageParticipant.save();
    }

    async removeFromStage(stage: ITournamentStage, participant: ITournamentParticipant): Promise<void> {
        await StageParticipant.delete({
            tournamentId: stage.tournamentId,
            stageNumber: stage.stageNumber,
            participantId: participant.participantId
        });
    }
}

class BracketType {

}

export class StageController {
    private static enrollmentConfigs: Map<string, EnrollmentConfig> = new Map();

    static addEnrollmentConfig(config: EnrollmentConfig) {
        if (StageController.enrollmentConfigs.has(config.name)) {
            throw new Error(`EnrollmentConfig ${config.name} already exists`);
        }
        StageController.enrollmentConfigs.set(config.name, config);
    }

    static getEnrollmentConfig(name: string): EnrollmentConfig {
        const config = StageController.enrollmentConfigs.get(name);
        if (config == null) {
            throw new Error(`No EnrollmentConfig ${name}`);
        }
        return config;
    }
}

@EventSubscriber()
export class StageControllerTournamentParticipantSubscriber implements EntitySubscriberInterface<TournamentParticipant> {
    listenTo() {
        return TournamentParticipant
    }

    async afterInsert(event: InsertEvent<TournamentParticipant>): Promise<void> {
        const stagesOfTournament = await TournamentStage.find({
            where: {
                tournamentId: event.entity.tournamentId
            }
        });
        for (const stage of stagesOfTournament) {
            const enrollmentConfig = StageController.getEnrollmentConfig(stage.enrollmentConfig.enrollmentType);
            enrollmentConfig.emit('participantAdded', stage, event.entity);
        }
    }

    async beforeRemove(event: RemoveEvent<TournamentParticipant>): Promise<void> {
        if (event.entity == null) {
            logger.warn("TournamentParticipant beforeRemove event called without entity - we can't make sure our StageParticipants are up to date now");
            return;
        }
        const stagesOfTournament = await TournamentStage.find({
            where: {
                tournamentId: event.entity.tournamentId
            }
        });
        for (const stage of stagesOfTournament) {
            const enrollmentConfig = StageController.getEnrollmentConfig(stage.enrollmentConfig.enrollmentType);
            enrollmentConfig.emit('participantRemoved', stage, event.entity);
        }
    }
}