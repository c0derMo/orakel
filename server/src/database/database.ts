import * as Mongoose from "mongoose";
import { TournamentModel } from "./schemas/tournament";
import { UserModel } from "./schemas/users"

let database: Mongoose.Connection;

export async function connect() {
    /*
     * add your own uri below
     * const uri = "mongodb+srv://<username>:<password>@cluster0-v6q0g.mongodb.net/test?retryWrites=true&w=majority";
     */
    const uri = process.env.MONGODBURI;
    if (database) {
        return;
    }
    await Mongoose.connect(uri, {
        autoIndex: true,
        autoCreate: true
    });
    database = Mongoose.connection;
    database.once("open", () => {
        console.log("Connected to database");
    });
    database.on("error", () => {
        console.log("Error connecting to database");
    });
    return {
        TournamentModel,
        UserModel
    };
}

export function disconnect() {
    if (!database) {
        return;
    }
    void Mongoose.disconnect();
}
