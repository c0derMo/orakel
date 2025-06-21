import { DataSource } from "typeorm";
import { User } from "../model/User";
import { AccessPermission } from "../model/AccessPermission";
import { Tournament } from "../model/Tournament";
import { TournamentStage } from "../model/TournamentStage";
import { TournamentParticipant } from "../model/TournamentParticipant";
import { StageParticipant } from "../model/StageParticipant";
import { consola } from "consola";
import { GameReport } from "../model/GameReport";
import type { Database } from "better-sqlite3";
import { StageMatch } from "model/StageMatch";

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
            StageMatch,
        ];

        logger.debug(
            "Creating sqlite(%s) DataSource for %d entities",
            database,
            entities.length,
        );
        logger.debug(entities.map((c) => c.name));

        this.dataSource = new DataSource({
            type: "better-sqlite3",
            database: database,
            subscribers: [],
            entities: entities,
            synchronize: true,
            prepareDatabase: (db: Database) => {
                logger.debug("Setting journal mode");
                db.pragma("journal_mode = WAL");
            },
        });
    }

    addSubscriber<T>(subscriber: string | (new () => T)) {
        (
            this.dataSource.options.subscribers as (
                | string
                | (new () => unknown)
            )[]
        ).push(subscriber);
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
