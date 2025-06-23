import { TournamentParticipant } from "model/TournamentParticipant";
import { EnrollmentConfig } from "./baseEnrollmentConfig";
import type { ITournamentParticipant } from "@shared/interfaces/ITournament";

export class AllParticipantsEnrollmentConfig extends EnrollmentConfig {
    static readonly name = "all_participants";
    static readonly publicName = "All Participants";

    public async initialize(): Promise<void> {
        const tournamentParticipants = await TournamentParticipant.findBy({
            tournamentId: this.stage.tournamentId,
        });
        for (const participant of tournamentParticipants) {
            await this.addToStage(participant);
        }
    }

    public async onTournamentParticipantInserted(
        tournamentParticipant: ITournamentParticipant,
    ): Promise<void> {
        await this.addToStage(tournamentParticipant);
    }

    public async onTournamentParticipantRemoved(
        tournamentParticipant: ITournamentParticipant,
    ): Promise<void> {
        await this.removeFromStage(tournamentParticipant);
    }
}
