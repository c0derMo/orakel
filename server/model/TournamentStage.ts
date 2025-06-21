import type { ITournamentStage } from "@shared/interfaces/ITournamentStage";
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
import { Tournament } from "./Tournament";
import type { IStageGameGroup } from "@shared/interfaces/IStageGame";
import { StageMatch } from "./StageMatch";

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
    @Column("simple-json")
    groups: IStageGameGroup[];

    @OneToMany(() => StageMatch, (match) => match.stage)
    matches: StageMatch[];

    @ManyToOne(() => Tournament)
    @JoinColumn({
        name: "tournamentId",
    })
    tournament: Tournament;
}
