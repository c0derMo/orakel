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
import type { IFullUser, IUserPermissions } from "@shared/interfaces/IUser";

@Entity()
export class User extends BaseEntity implements IFullUser {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column("text")
    username: string;
    @Column("text")
    passwordHash: string;
    @Column("simple-json")
    permissions: IUserPermissions[];
    @CreateDateColumn()
    registrationDate: Date;
    @UpdateDateColumn()
    lastUpdated: Date;
    @OneToMany(() => AccessPermission, (ap) => ap.userId)
    accessibleTournaments: AccessPermission[];
    @OneToMany(() => Tournament, (t) => t.owner)
    owningTournaments: Tournament[];
}
