import { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import { EnrollmentConfig } from "./baseEnrollmentConfig";
import { ITournamentParticipant } from "@shared/interfaces/ITournament";

export class AllParticipantsEnrollmentConfig extends EnrollmentConfig {
    constructor() {
        super("all_participants", "All Participants");
        this.on("tournamentParticipantInserted", this.participantAdded);
        this.on("tournamentParticipantRemoved", this.participantRemoved);
    }

    public participantAdded = (
        stage: ITournamentStage,
        participant: ITournamentParticipant,
    ) => {
        void this.addToStage(stage, participant);
    };

    public participantRemoved = (
        stage: ITournamentStage,
        participant: ITournamentParticipant,
    ) => {
        void this.removeFromStage(stage, participant);
    };
}
