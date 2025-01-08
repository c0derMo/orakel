import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Bracket } from "./Bracket";
import {
    ITournament,
    ITournamentParticipant,
} from "@shared/interfaces/ITournament";
import { TournamentParticipant } from "./TournamentParticipant";

@Entity()
export class Tournament extends BaseEntity implements ITournament {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column("text")
    urlName: string;
    @Column("text")
    owner: string;
    @ManyToOne(() => User)
    @JoinColumn({
        name: "owner",
    })
    owningUser: User;
    @Column("text")
    name: string;
    @Column("boolean")
    private: boolean;
    @OneToMany(() => Bracket, (bracket) => bracket.tournamentId)
    brackets: Bracket[];
    @OneToMany(
        () => TournamentParticipant,
        (participant) => participant.tournamentId,
    )
    participants: ITournamentParticipant[];
}
