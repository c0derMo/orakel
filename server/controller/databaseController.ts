import { DataSource } from "typeorm";
import { User } from "../model/User";
import { AccessPermission } from "../model/AccessPermission";
import { Tournament } from "../model/Tournament";
import { Bracket } from "../model/Bracket";
import consola from "consola";

const logger = consola.withTag("Database");

export class DatabaseController {
    private dataSource: DataSource;

    constructor(database: string) {
        const entities = [User, Bracket, AccessPermission, Tournament];

        logger.debug(
            "Creating sqlite(%s) DataSource for %d entities",
            database,
            entities.length,
        );
        logger.debug(entities.map((c) => c.name));

        this.dataSource = new DataSource({
            type: "sqlite",
            database: database,
            entities: entities,
            synchronize: true,
        });
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
