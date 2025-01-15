import { IStageParticipant } from "@shared/interfaces/ITournamentStage";
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from "typeorm";
import { TournamentStage } from "./TournamentStage";

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
    @ManyToOne(() => TournamentStage)
    @JoinColumn([
        { name: "tournamentId", referencedColumnName: "tournamentId" },
        { name: "stageNumber", referencedColumnName: "stageNumber" },
    ])
    stage: TournamentStage;
}
