import {
    EventHandlerRequest,
    H3Event,
    createError,
    getRequestHeader,
} from "h3";
import { User } from "../model/User";
import { AuthController } from "../controller/authController";
import { Tournament } from "../model/Tournament";
import { TournamentPermission } from "@shared/interfaces/ITournament";

export async function getUserOrFail(
    event: H3Event<EventHandlerRequest>,
): Promise<User> {
    const fullHeader = getRequestHeader(event, "Authorization");
    if (!fullHeader?.startsWith("Bearer ")) {
        throw createError({ statusCode: 401 });
    }

    const token = fullHeader.substring(7);
    const tokenData = AuthController.verifyToken(token);
    if (tokenData == null) {
        throw createError({ statusCode: 401 });
    }

    const user = await User.findOneBy({ id: tokenData.userId });
    if (user == null) {
        throw createError({ statusCode: 401 });
    }
    return user;
}

export async function ensurePermission(
    tournament: Tournament,
    user: User,
    permission: TournamentPermission,
): Promise<void> {
    const hasPermission = await tournament.hasPermission(user.id, permission);
    if (!hasPermission) {
        throw createError({ statusCode: 403 });
    }
}
