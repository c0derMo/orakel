import type { IStageGame } from "@shared/interfaces/IStageGame";
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryColumn,
} from "typeorm";
import { GameReport } from "./GameReport";
import { TournamentStage } from "./TournamentStage";

@Entity()
export class StageMatch extends BaseEntity implements IStageGame {
    @PrimaryColumn("text")
    tournamentId: string;
    @PrimaryColumn("integer")
    stageNumber: number;
    @PrimaryColumn("integer")
    matchNumber: number;

    @Column("integer", { nullable: true })
    groupNumber?: number;
    @Column("simple-json")
    participantIds: (string | null)[];
    @Column("simple-json")
    precessorGames: (number | null)[];
    @Column("simple-json")
    templateParticipantNames: string[];
    @Column("integer")
    participants: number;

    @OneToOne(() => GameReport, (report) => report.match, {
        nullable: true,
        eager: true,
    })
    result?: GameReport;

    @ManyToOne(() => TournamentStage)
    @JoinColumn([
        { name: "tournamentId", referencedColumnName: "tournamentId" },
        { name: "stageNumber", referencedColumnName: "stageNumber" },
    ])
    stage: TournamentStage;

    public static fromObject(object: IStageGame) {
        const match = new StageMatch();
        match.tournamentId = object.tournamentId;
        match.stageNumber = object.stageNumber;
        match.matchNumber = object.matchNumber;
        match.groupNumber = object.groupNumber;
        match.participantIds = object.participantIds;
        match.precessorGames = object.precessorGames;
        match.templateParticipantNames = object.templateParticipantNames;
        match.participants = object.participants;
        return match;
    }
}
