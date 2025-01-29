import {
    ITournament,
    ITournamentParticipant,
} from "@shared/interfaces/ITournament";
import {
    IStageParticipant,
    ITournamentStage,
} from "@shared/interfaces/ITournamentStage";
import { StageParticipant } from "../../../model/StageParticipant";

export class EnrollmentConfig {
    public static readonly name: string;
    public static readonly publicName: string;

    protected readonly stage: ITournamentStage;
    protected readonly tournament: ITournament;

    constructor(stage: ITournamentStage, tournament: ITournament) {
        this.stage = stage;
        this.tournament = tournament;
    }

    public tournamentUpdated(): Promise<void> | void {
        return;
    }

    public tournamentParticipantInserted(
        tournamentParticipant: ITournamentParticipant,
    ): Promise<void> | void {
        void tournamentParticipant;
    }

    public tournamentParticipantUpdated(
        tournamentParticipant: ITournamentParticipant,
    ): Promise<void> | void {
        void tournamentParticipant;
    }

    public tournamentParticipantRemoved(
        tournamentParticipant: ITournamentParticipant,
    ): Promise<void> | void {
        void tournamentParticipant;
    }

    public tournamentStageInserted(
        stage: ITournamentStage,
    ): Promise<void> | void {
        void stage;
    }

    public tournamentStageUpdated(
        stage: ITournamentStage,
    ): Promise<void> | void {
        void stage;
    }

    public tournamentStageRemoved(
        stage: ITournamentStage,
    ): Promise<void> | void {
        void stage;
    }

    public stageParticipantInserted(
        participant: IStageParticipant,
    ): Promise<void> | void {
        void participant;
    }

    public stageParticipantUpdated(
        participant: IStageParticipant,
    ): Promise<void> | void {
        void participant;
    }

    public stageParticipantRemoved(
        participant: IStageParticipant,
    ): Promise<void> | void {
        void participant;
    }

    public initialize(): Promise<void> | void {
        return;
    }

    protected async addToStage(
        participant: ITournamentParticipant,
        additionalData?: Record<string, unknown>,
    ): Promise<void> {
        const stageParticipant = StageParticipant.create({
            tournamentId: this.stage.tournamentId,
            stageNumber: this.stage.stageNumber,
            participantId: participant.participantId,
            additionalInfo: additionalData,
        });
        await stageParticipant.save();
    }

    protected async removeFromStage(
        participant: ITournamentParticipant,
    ): Promise<void> {
        await StageParticipant.delete({
            tournamentId: this.stage.tournamentId,
            stageNumber: this.stage.stageNumber,
            participantId: participant.participantId,
        });
    }
}
