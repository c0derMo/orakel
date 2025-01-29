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
import { TournamentStage } from "./TournamentStage";
import { ITournament } from "@shared/interfaces/ITournament";
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

    @OneToMany(() => TournamentStage, (stage) => stage.tournament)
    stages: TournamentStage[];
    @OneToMany(
        () => TournamentParticipant,
        (participant) => participant.tournament,
    )
    participants: TournamentParticipant[];
}
