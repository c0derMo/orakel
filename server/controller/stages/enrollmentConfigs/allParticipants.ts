import { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import { EnrollmentConfig } from "./baseEnrollmentConfig";
import { ITournamentParticipant } from "@shared/interfaces/ITournament";

export class AllParticipantsEnrollmentConfig extends EnrollmentConfig {
    constructor() {
        super("all_participants");
        this.on("tournamentParticipantInserted", this.participantAdded);
        this.on("tournamentParticipantRemoved", this.participantRemoved);
    }

    async participantAdded(
        stage: ITournamentStage,
        participant: ITournamentParticipant,
    ) {
        this.addToStage(stage, participant);
    }

    async participantRemoved(
        stage: ITournamentStage,
        participant: ITournamentParticipant,
    ) {
        this.removeFromStage(stage, participant);
    }
}
