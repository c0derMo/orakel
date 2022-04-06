import { DatabaseProvider } from "../databaseConnector";
import * as Mongoose from "mongoose";
import { Tournament } from "../../model/Tournament";
import {TournamentModel} from "./schemas/tournament";
import {MongoTournament, MongoUser} from "./mongodb_types";
import {User} from "../../model/User";
import {UserModel} from "./schemas/users";

export class MongoDBProvider implements DatabaseProvider {

    private database: Mongoose.Connection;

    async initialize(): Promise<void> {
        if (this.database) {
            return;
        }
        await Mongoose.connect(process.env.MONGODBURI, {
            autoIndex: true,
            autoCreate: true
        });
        this.database = Mongoose.connection;
        return;
    }

    async destroy(): Promise<void> {
        if (!this.database) {
            return;
        }
        await Mongoose.disconnect();
    }

    async getTournamentById(tournamentId: string): Promise<Tournament> {
        if (!this.database) {
            await this.initialize();
        }
        const tourney = await TournamentModel.findById(tournamentId);
        return new MongoTournament(tourney);
    }

    async getTournamentByName(tournamentName: string): Promise<Tournament> {
        if (!this.database) {
            await this.initialize();
        }
        const tourney = await TournamentModel.findOne({name: tournamentName});
        return new MongoTournament(tourney);
    }

    async getAllTournaments(): Promise<Tournament[]> {
        if (!this.database) {
            await this.initialize();
        }
        const tourneys = await TournamentModel.find().exec();
        return tourneys.map((e) => { return new MongoTournament(e) });
    }

    async getUserById(userId: string): Promise<User> {
        if (!this.database) {
            await this.initialize();
        }
        const user = await UserModel.findById(userId);
        return new MongoUser(user);
    }

    async getUserByName(username: string): Promise<User> {
        if (!this.database) {
            await this.initialize();
        }
        const user = await UserModel.findOne({name: username});
        return new MongoUser(user);
    }

}
