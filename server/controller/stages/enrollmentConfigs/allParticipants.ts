import { EnrollmentConfig } from "./baseEnrollmentConfig";
import { ITournamentParticipant } from "@shared/interfaces/ITournament";

export class AllParticipantsEnrollmentConfig extends EnrollmentConfig {
    static readonly name = "all_participants";
    static readonly publicName = "All Participants";

    public async initialize(): Promise<void> {
        for (const participant of this.tournament.participants) {
            await this.addToStage(participant);
        }
    }

    public async tournamentParticipantInserted(
        tournamentParticipant: ITournamentParticipant,
    ): Promise<void> {
        await this.addToStage(tournamentParticipant);
    }

    public async tournamentParticipantRemoved(
        tournamentParticipant: ITournamentParticipant,
    ): Promise<void> {
        await this.removeFromStage(tournamentParticipant);
    }
}
