import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class AccessPermission extends BaseEntity {
    @PrimaryColumn("text")
    tournament: string;
    @PrimaryColumn("text")
    user: string;
    // TODO: Permission type!
    @Column("simple-json")
    permissions: unknown;
}
