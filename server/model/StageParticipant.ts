import { IStageParticipant } from "@shared/interfaces/ITournamentStage";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class StageParticipant extends BaseEntity implements IStageParticipant {
    @PrimaryColumn("text")
    tournamentId: string;
    @PrimaryColumn("integer")
    stageNumber: number;
    @PrimaryColumn("text")
    participantId: string;
    @Column("simple-json")
    additionalInfo: Record<string, unknown>;
}
