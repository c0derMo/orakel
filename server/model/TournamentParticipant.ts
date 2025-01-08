import { ITournamentParticipant } from "@shared/interfaces/ITournament";
import {
    BaseEntity,
    Column,
    Entity,
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from "typeorm";

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
    @Column("simple-json")
    additionalInfo: Record<string, unknown>;
}
