import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Bracket extends BaseEntity {
    @PrimaryColumn("text")
    tournament: string;
    @PrimaryColumn("text")
    name: string;
    @Column("text")
    type: string;
}