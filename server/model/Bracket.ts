import {
    IBracket,
    IBracketEnrollmentConfig,
} from "@shared/interfaces/IBracket";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Bracket extends BaseEntity implements IBracket {
    @PrimaryColumn("text")
    tournamentId: string;
    @PrimaryColumn("text")
    name: string;
    @Column("text")
    type: string;
    @Column("simple-json")
    enrollmentConfig: IBracketEnrollmentConfig;
}
