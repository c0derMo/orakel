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
import type {
    IExtendedUser,
    IFullUser,
    IPublicUser,
    IUserPermissions,
} from "@shared/interfaces/IUser";
import type { ISerializable } from "./ISerializable";

@Entity()
export class User extends BaseEntity implements IFullUser, ISerializable {
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

    serialized = false;

    toPublicUser(): IPublicUser & ISerializable {
        return {
            id: this.id,
            username: this.username,
            registrationDate: this.registrationDate,
            serialized: true,
        };
    }

    toExtendedUser(): IExtendedUser & ISerializable {
        return {
            id: this.id,
            username: this.username,
            registrationDate: this.registrationDate,
            permissions: this.permissions,
            accessibleTournaments: this.accessibleTournaments,
            owningTournaments: this.owningTournaments,
            serialized: true,
        };
    }
}
