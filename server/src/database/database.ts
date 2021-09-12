import * as Mongoose from "mongoose";
import { TournamentModel } from "./schemas/tournament";
import { UserModel } from "./schemas/users"

let database: Mongoose.Connection;

export const connect = () => {
    // add your own uri below
    // const uri = "mongodb+srv://<username>:<password>@cluster0-v6q0g.mongodb.net/test?retryWrites=true&w=majority";
    const uri = process.env.MONGODBURI;
    if (database) {
        return;
    }
    Mongoose.connect(uri, {
        autoIndex: true,
        autoCreate: true
    });
    database = Mongoose.connection;
    database.once("open", async () => {
        console.log("Connected to database");
    });
    database.on("error", () => {
        console.log("Error connecting to database");
    });
    return {
        TournamentModel,
        UserModel
    };
};
export const disconnect = () => {
    if (!database) {
        return;
    }
    Mongoose.disconnect();
};