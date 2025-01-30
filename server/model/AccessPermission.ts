import {
    IAccessPermission,
    TournamentPermission,
} from "@shared/interfaces/ITournament";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Tournament } from "./Tournament";

@Entity()
export class AccessPermission extends BaseEntity implements IAccessPermission {
    @PrimaryColumn("text")
    tournamentId: string;
    @PrimaryColumn("text")
    userId: string;
    @Column("simple-json")
    permissions: TournamentPermission[];

    @ManyToOne(() => Tournament)
    @JoinColumn({
        name: "tournamentId"
    })
    tournament: Tournament;
}
