import { ITournamentStage } from "@shared/interfaces/ITournamentStage";
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
} from "typeorm";
import { StageParticipant } from "./StageParticipant";
import { GameReport } from "./GameReport";
import { Tournament } from "./Tournament";

@Entity()
export class TournamentStage extends BaseEntity implements ITournamentStage {
    @PrimaryColumn("text")
    tournamentId: string;
    @PrimaryColumn("integer")
    stageNumber: number;
    @Column("text")
    name: string;
    @Column("text")
    stageType: string;
    @Column("simple-json", { nullable: true })
    stageConfig: Record<string, unknown>;
    @Column("text")
    enrollmentType: string;
    @Column("simple-json", { nullable: true })
    enrollmentConfig: Record<string, unknown>;
    @OneToMany(() => StageParticipant, (sp) => sp.stage)
    participants: StageParticipant[];
    @OneToMany(() => GameReport, (g) => g.stage)
    reportedGames: GameReport[];

    @ManyToOne(() => Tournament)
    @JoinColumn({
        name: "tournamentId",
    })
    tournament: Tournament;
}
