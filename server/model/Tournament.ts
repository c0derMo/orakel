import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { TournamentStage } from "./TournamentStage";
import type {
    ITournament,
    TournamentPermission,
} from "@shared/interfaces/ITournament";
import { TournamentParticipant } from "./TournamentParticipant";
import { AccessPermission } from "./AccessPermission";

@Entity()
export class Tournament extends BaseEntity implements ITournament {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column("text")
    urlName: string;
    @Column("text")
    owner: string;
    @ManyToOne(() => User)
    @JoinColumn({
        name: "owner",
    })
    owningUser: User;
    @Column("text")
    name: string;
    @Column("boolean")
    private: boolean;

    @OneToMany(() => TournamentStage, (stage) => stage.tournament)
    stages: TournamentStage[];
    @OneToMany(
        () => TournamentParticipant,
        (participant) => participant.tournament,
    )
    participants: TournamentParticipant[];
    @OneToMany(() => AccessPermission, (ap) => ap.tournament)
    accessPermissions: AccessPermission[];

    async hasPermission(
        userId: string,
        permission: TournamentPermission,
    ): Promise<boolean> {
        if (this.owner === userId) {
            return true;
        }

        let userPermissions: AccessPermission | undefined | null;
        if (this.accessPermissions != null) {
            userPermissions = this.accessPermissions.find(
                (ap) => ap.userId === userId,
            );
        } else {
            userPermissions = await AccessPermission.findOne({
                where: {
                    tournamentId: this.id,
                    userId: userId,
                },
            });
        }

        if (userPermissions == null) {
            return false;
        }
        return userPermissions.permissions.includes(permission);
    }
}
