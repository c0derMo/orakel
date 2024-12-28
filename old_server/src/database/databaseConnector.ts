import {Tournament} from "../model/Tournament";
import {MongoDBProvider} from "./mongodb/mongodb_provider";
import {User} from "../model/User";

export interface DatabaseProvider {
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    getAllTournaments(): Promise<Tournament[]>;
    getTournamentById(tournamentId: string): Promise<Tournament>;
    getTournamentByName(tournamentName: string): Promise<Tournament>;
    getUserById(userId: string): Promise<User>;
    getUserByName(username: string): Promise<User>;
}


const databaseProviders = {
    "mongodb": new MongoDBProvider()
}

// To be changed by environment variable
const databaseType = "mongodb";

export function getDatabase(): DatabaseProvider {
    return databaseProviders[databaseType];
}
