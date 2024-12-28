import "dotenv/config";
import { createServer } from "node:http";
import { toNodeListener } from "h3";
import { app } from "./app";
import withShutdown from "http-shutdown";
import PluginController from "./controller/pluginController";
import consola from "consola";
import { DatabaseController } from "./controller/databaseController";

const server = withShutdown(createServer(toNodeListener(app)));
let db: DatabaseController;

async function start() {
    consola.start("Orakel Server starting...");
    const pm = new PluginController(import.meta.dirname);
    await pm.findAndLoadPlugins();

    db = new DatabaseController("./orakel.db");
    await db.connect();

    server.listen(3000);
    consola.success("Server started.");
}

function shutdown() {
    server.shutdown(async (err: Error) => {
        if (err) {
            consola.error("Error while stopping server:");
            consola.error(err);
        }
        await db.disconnect();
        consola.info("Orakel server stopped.");
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

void start();
