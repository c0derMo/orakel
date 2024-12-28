import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { AccessPermission } from "./AccessPermission";
import { Tournament } from "./Tournament";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column("text")
    username: string;
    @Column("text")
    passwordHash: string;
    // TODO: Permissions!
    @Column("simple-json")
    permissions: unknown[];
    @CreateDateColumn()
    registrationDate: Date;
    @UpdateDateColumn()
    lastUpdated: Date;
    @OneToMany(() => AccessPermission, (ap) => ap.user)
    accessableTournaments: AccessPermission[];
    @OneToMany(() => Tournament, (t) => t.owner)
    owningTournaments: Tournament[];
}
