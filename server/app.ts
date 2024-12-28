import { createApp, createRouter, defineEventHandler, useBase } from "h3";
import { authRouter } from "./api/auth";

export const app = createApp();

const router = createRouter();
app.use(router);

app.use(useBase("/api/auth", authRouter.handler));

router.get(
    "/",
    defineEventHandler((event) => {
        return { path: event.path, message: "Hello World!" };
    }),
);
