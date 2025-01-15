import { IGameReport } from "@shared/interfaces/IStageGame";
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
export class GameReport extends BaseEntity implements IGameReport {
    @PrimaryColumn("text")
    tournamentId: string;
    @PrimaryColumn("integer")
    stageNumber: number;
    @PrimaryColumn("integer")
    matchNumber: number;
    @Column("simple-json")
    scores: number[];

    @ManyToOne(() => TournamentStage)
    @JoinColumn([
        { name: "tournamentId", referencedColumnName: "tournamentId" },
        { name: "stageNumber", referencedColumnName: "stageNumber" },
    ])
    stage: TournamentStage;
}
