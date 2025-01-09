import { createError, createRouter, eventHandler, readValidatedBody } from "h3";
import { AuthController } from "../controller/authController";
import { z } from "zod";

export const authRouter = createRouter();

authRouter.post(
    "/login",
    eventHandler(async (event) => {
        const bodySchema = z.object({
            username: z.string(),
            password: z.string(),
        });

        // TODO: Custom "read validated body" with better error returning?
        const data = await readValidatedBody(event, (body) =>
            bodySchema.parse(body),
        );

        const authResult = await AuthController.tryLogin(
            data.username,
            data.password,
        );

        if (!authResult) {
            throw createError({
                statusCode: 401,
                statusMessage: "invalid login",
            });
        }

        return {
            token: authResult.token,
            user: authResult.user.toExtendedUser(),
        };
    }),
);
