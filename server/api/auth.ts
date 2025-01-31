import { createError, createRouter, eventHandler } from "h3";
import { AuthController } from "../controller/authController";
import { z } from "zod";
import { validateBody } from "../utils/requestValidation";

export const authRouter = createRouter();

authRouter.post(
    "/login",
    eventHandler(async (event) => {
        const bodySchema = z.object({
            username: z.string(),
            password: z.string(),
        });

        const data = await validateBody(event, bodySchema);

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
