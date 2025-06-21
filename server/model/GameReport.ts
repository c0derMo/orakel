import type { IGameReport } from "@shared/interfaces/IStageGame";
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryColumn,
} from "typeorm";
import { TournamentStage } from "./TournamentStage";
import { StageMatch } from "./StageMatch";

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
    @Column("simple-json")
    ranking: number[];

    @ManyToOne(() => TournamentStage)
    @JoinColumn([
        { name: "tournamentId", referencedColumnName: "tournamentId" },
        { name: "stageNumber", referencedColumnName: "stageNumber" },
    ])
    stage: TournamentStage;

    @OneToOne(() => StageMatch, (match) => match.result)
    @JoinColumn([
        { name: "tournamentId", referencedColumnName: "tournamentId" },
        { name: "stageNumber", referencedColumnName: "stageNumber" },
        { name: "matchNumber", referencedColumnName: "matchNumber" },
    ])
    match: StageMatch;
}
