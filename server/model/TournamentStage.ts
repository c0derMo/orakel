import {
    ITournamentStage,
    IStageEnrollmentConfig,
} from "@shared/interfaces/ITournamentStage";
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { StageParticipant } from "./StageParticipant";
import { GameReport } from "./GameReport";

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
    @OneToMany(() => StageParticipant, (sp) => sp.stage)
    participants: StageParticipant[];
    @OneToMany(() => GameReport, (g) => g.stage)
    reportedGames: GameReport[];
}
