import { DataSource } from "typeorm";
import { User } from "../model/User";
import { AccessPermission } from "../model/AccessPermission";
import { Tournament } from "../model/Tournament";
import { TournamentStage } from "../model/TournamentStage";
import { TournamentParticipant } from "../model/TournamentParticipant";
import { StageParticipant } from "../model/StageParticipant";
import consola from "consola";
import { GameReport } from "../model/GameReport";

const logger = consola.withTag("Database");

export class DatabaseController {
    private dataSource: DataSource;

    constructor(database: string) {
        const entities = [
            User,
            TournamentStage,
            AccessPermission,
            Tournament,
            TournamentParticipant,
            StageParticipant,
            GameReport,
        ];

        logger.debug(
            "Creating sqlite(%s) DataSource for %d entities",
            database,
            entities.length,
        );
        logger.debug(entities.map((c) => c.name));

        this.dataSource = new DataSource({
            type: "sqlite",
            database: database,
            subscribers: [],
            entities: entities,
            synchronize: true,
        });
    }

    addSubscriber(subscriber: string | Function) {
        (this.dataSource.options.subscribers as (string | Function)[]).push(
            subscriber,
        );
    }

    async connect() {
        if (this.dataSource.isInitialized) {
            logger.warn(
                "connect() called even though database is already connected!",
            );
            return;
        }
        await this.dataSource.initialize();
        logger.success("Database connected.");
    }

    async disconnect() {
        if (!this.dataSource.isInitialized) {
            logger.warn(
                "disconnect() called even though database is not connected!",
            );
            return;
        }
        await this.dataSource.destroy();
        logger.success("Database disconnected.");
    }
}
