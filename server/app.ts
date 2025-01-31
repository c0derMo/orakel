import { createApp, createRouter, defineEventHandler, useBase } from "h3";
import { authRouter } from "./api/auth";
import { ensureSerialized } from "./model/ISerializable";
import { StageController } from "./controller/stages/stageController";
import { buildDataRouter } from "./api/data";
import { TournamentRouter } from "./api/tournament";
import { EntityNotFoundError } from "typeorm";

export function buildH3App(stageController: StageController) {
    const app = createApp({
        onBeforeResponse: (event, response) => {
            if (response.body == null) {
                return;
            }
            response.body = ensureSerialized(response.body, event.path);
        },
        onError: (error) => {
            if (!error.unhandled) {
                return;
            }
            if (error.cause instanceof EntityNotFoundError) {
                error.unhandled = false;
                error.statusCode = 404;
            }
        },
    });

    const router = createRouter();
    app.use(router);

    const tournamentRouter = new TournamentRouter(stageController);
    app.use(useBase("/api/auth", authRouter.handler));
    app.use(useBase("/api/tournament", tournamentRouter.buildRouter().handler));
    app.use(useBase("/api/data", buildDataRouter(stageController).handler));

    router.get(
        "/",
        defineEventHandler((event) => {
            return { path: event.path, message: "Hello World!" };
        }),
    );

    return app;
}
