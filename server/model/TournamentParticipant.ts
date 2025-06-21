import type { ITournamentParticipant } from "@shared/interfaces/ITournament";
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tournament } from "./Tournament";

@Entity()
export class TournamentParticipant
    extends BaseEntity
    implements ITournamentParticipant
{
    @PrimaryColumn("text")
    tournamentId: string;
    @PrimaryGeneratedColumn("uuid")
    participantId: string;
    @Column("text")
    username: string;
    @Column("text", { nullable: true })
    userId?: string;
    @Column("simple-json", { nullable: true })
    additionalInfo?: Record<string, unknown>;

    @ManyToOne(() => Tournament)
    @JoinColumn({
        name: "tournamentId",
    })
    tournament: Tournament;
}
