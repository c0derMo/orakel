import * as express from "express";
import * as cors from 'cors';
import * as bodyParser from "body-parser";
import "dotenv/config";

import { getDatabase } from "./database/databaseConnector";

import AuthenticatorRouter from "./routers/authenticator";
import TournamentsRouter from "./routers/tournaments"

async function main() {
    await getDatabase().initialize();

    const app = express();
    const port = 5002;

    app.use(cors({
        origin: "http://localhost:8080"
    }));
    app.use(bodyParser.json());

    app.use("/api/users", AuthenticatorRouter);
    app.use("/api/tournaments", TournamentsRouter);

    app.use("/", express.static("html"));

    app.listen(port, () => {
        console.log(`Server started on http://localhost:${port}`);
    });
}

void main();
