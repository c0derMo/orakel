import { User } from "../model/User";
import bcrypt from "bcrypt";
import { EventHandlerRequest, getRequestHeader, H3Event } from "h3";
import jwt from "jsonwebtoken";

interface AuthorizationResult {
    token: string;
    user: User;
}

interface TokenContent {
    userId: string;
}

export class AuthController {
    private static tokenSecret = "SomeSuperSecretToken123!";

    static async tryLogin(
        username: string,
        password: string,
    ): Promise<AuthorizationResult | null> {
        if (username == null || password == null) {
            return null;
        }
        const user = await User.findOneBy({
            username: username,
        });
        if (!user) {
            return null;
        }
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return null;
        }
        const token = jwt.sign(
            {
                userId: user.id,
            } as TokenContent,
            this.tokenSecret,
            { expiresIn: "7d" },
        );

        return { token, user };
    }

    static verifyToken(token: string): TokenContent | null {
        try {
            const tokenData = jwt.verify(
                token,
                this.tokenSecret,
            ) as TokenContent;
            return tokenData;
        } catch {
            return null;
        }
    }
}

export function getUserToken(
    event: H3Event<EventHandlerRequest>,
): string | null {
    const fullHeader = getRequestHeader(event, "Authorization");
    if (fullHeader == null) {
        return null;
    }

    if (!fullHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = fullHeader.substring(7);
    return AuthController.verifyToken(token)?.userId ?? null;
}

export async function getUser(
    event: H3Event<EventHandlerRequest>,
): Promise<User | null> {
    const userId = getUserToken(event);
    if (userId == null) {
        return null;
    }

    const user = await User.findOneBy({ id: userId });
    return user;
}
