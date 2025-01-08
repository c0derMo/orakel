import { createApp, createRouter, defineEventHandler, useBase } from "h3";
import { authRouter } from "./api/auth";
import { tournamentRouter } from "./api/tournament";

export const app = createApp();

const router = createRouter();
app.use(router);

app.use(useBase("/api/auth", authRouter.handler));
app.use(useBase("/api/tournament", tournamentRouter.handler));

router.get(
    "/",
    defineEventHandler((event) => {
        return { path: event.path, message: "Hello World!" };
    }),
);
