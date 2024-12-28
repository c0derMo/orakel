import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Bracket } from "./Bracket";

@Entity()
export class Tournament extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column("text")
    urlName: string;
    @Column("text")
    owner: string;
    @ManyToOne(() => User)
    @JoinColumn({
        name: "owner"
    })
    owningUser?: User;
    @Column("text")
    name: string;
    @Column("boolean")
    private: boolean;
    @OneToMany(() => Bracket, (bracket) => bracket.tournament)
    brackets: Bracket[];
}