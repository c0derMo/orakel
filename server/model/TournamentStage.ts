import {
    ITournamentStage,
    IStageEnrollmentConfig,
} from "@shared/interfaces/ITournamentStage";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class TournamentStage extends BaseEntity implements ITournamentStage {
    @PrimaryColumn("text")
    tournamentId: string;
    @PrimaryColumn("integer")
    stageNumber: number;
    @Column("text")
    name: string;
    @Column("text")
    type: string;
    @Column("simple-json")
    enrollmentConfig: IStageEnrollmentConfig;
}
