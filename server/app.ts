import { createApp, createRouter, defineEventHandler, useBase } from "h3";
import { authRouter } from "./api/auth";
import { buildTournamentRouter } from "./api/tournament";
import { ensureSerialized } from "./model/ISerializable";
import { StageController } from "./controller/stages/stageController";

export function buildH3App(stageController: StageController) {
    const app = createApp({
        onBeforeResponse: (event, response) => {
            if (response.body == null) {
                return;
            }
            response.body = ensureSerialized(response.body, event.path);
        },
    });
    
    const router = createRouter();
    app.use(router);
    
    app.use(useBase("/api/auth", authRouter.handler));
    // app.use(useBase("/api/tournament", buildTournamentRouter(stageController).handler));
    router.use("/api/tournament/**", useBase("/api/tournament", buildTournamentRouter(stageController).handler));
    
    router.get(
        "/",
        defineEventHandler((event) => {
            return { path: event.path, message: "Hello World!" };
        }),
    );

    return app;
}

