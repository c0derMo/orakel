import {
    ITournament,
    ITournamentParticipant,
} from "@shared/interfaces/ITournament";
import {
    IStageParticipant,
    ITournamentStage,
} from "@shared/interfaces/ITournamentStage";
import { EventEmitter } from "node:events";
import { StageParticipant } from "../../../model/StageParticipant";

interface EnrollmentConfigEvents {
    tournamentUpdated: [stage: ITournamentStage, tournament: ITournament];
    tournamentParticipantInserted: [
        stage: ITournamentStage,
        participant: ITournamentParticipant,
    ];
    tournamentParticipantUpdated: [
        stage: ITournamentStage,
        participant: ITournamentParticipant,
    ];
    tournamentParticipantRemoved: [
        stage: ITournamentStage,
        participant: ITournamentParticipant,
    ];
    tournamentStageInserted: [
        stage: ITournamentStage,
        targetStage: ITournamentStage,
    ];
    tournamentStageUpdated: [
        stage: ITournamentStage,
        targetStage: ITournamentStage,
    ];
    tournamentStageRemoved: [
        stage: ITournamentStage,
        targetStage: ITournamentStage,
    ];
    stageParticipantInserted: [
        stage: ITournamentStage,
        participant: IStageParticipant,
    ];
    stageParticipantUpdated: [
        stage: ITournamentStage,
        participant: IStageParticipant,
    ];
    stageParticipantRemoved: [
        stage: ITournamentStage,
        participant: IStageParticipant,
    ];
}

export class EnrollmentConfig extends EventEmitter<EnrollmentConfigEvents> {
    readonly name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    async addToStage(
        stage: ITournamentStage,
        participant: ITournamentParticipant,
        additionalData?: Record<string, unknown>,
    ): Promise<void> {
        const stageParticipant = StageParticipant.create({
            tournamentId: stage.tournamentId,
            stageNumber: stage.stageNumber,
            participantId: participant.participantId,
            additionalInfo: additionalData ?? {},
        });
        await stageParticipant.save();
    }

    async removeFromStage(
        stage: ITournamentStage,
        participant: ITournamentParticipant,
    ): Promise<void> {
        await StageParticipant.delete({
            tournamentId: stage.tournamentId,
            stageNumber: stage.stageNumber,
            participantId: participant.participantId,
        });
    }
}
