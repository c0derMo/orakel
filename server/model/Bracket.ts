import { IBracket } from "@shared/interfaces/ITournament";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Bracket extends BaseEntity implements IBracket {
    @PrimaryColumn("text")
    tournamentId: string;
    @PrimaryColumn("text")
    name: string;
    @Column("text")
    type: string;
}
