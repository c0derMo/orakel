import {
    IAccessPermission,
    TournamentPermission,
} from "@shared/interfaces/ITournament";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class AccessPermission extends BaseEntity implements IAccessPermission {
    @PrimaryColumn("text")
    tournamentId: string;
    @PrimaryColumn("text")
    userId: string;
    @Column("simple-json")
    permissions: TournamentPermission[];
}
