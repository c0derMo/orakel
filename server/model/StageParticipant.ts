import type { IStageParticipant } from "@shared/interfaces/ITournamentStage";
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from "typeorm";
import { TournamentStage } from "./TournamentStage";

@Entity({
    orderBy: {
        seed: "ASC",
    },
})
export class StageParticipant extends BaseEntity implements IStageParticipant {
    @PrimaryColumn("text")
    tournamentId: string;
    @PrimaryColumn("integer")
    stageNumber: number;
    @PrimaryColumn("integer")
    seed: number;
    @Column("text")
    participantId: string;
    @Column("simple-json")
    additionalInfo: Record<string, unknown>;
    @Column("text", { nullable: true })
    dummyName: string | null;

    @ManyToOne(() => TournamentStage)
    @JoinColumn([
        { name: "tournamentId", referencedColumnName: "tournamentId" },
        { name: "stageNumber", referencedColumnName: "stageNumber" },
    ])
    stage: TournamentStage;
}
