import { createError, createRouter, eventHandler, readBody } from "h3";
import { AuthController } from "../controller/authController";

export const authRouter = createRouter();

authRouter.post(
    "/login",
    eventHandler(async (event) => {
        // TODO: Verify body
        const data = await readBody<{
            username: string;
            password: string;
        }>(event);

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
