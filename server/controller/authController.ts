import { User } from "../model/User"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface AuthorizationResult {
    token: string;
    user: User;
}

export class AuthController {

    private static tokenSecret = "SomeSuperSecretToken123!"

    static async tryLogin(username: string, password: string): Promise<AuthorizationResult | null> {
        if (username == null || password == null) {
            return null;
        }
        const user = await User.findOneBy({
            username: username
        });
        if (!user) {
            return null;
        }
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return null;
        }
        const token = jwt.sign({
            userId: user.id
        }, this.tokenSecret, { expiresIn: '7d' });

        // TODO: Leaking the entire user here might not be the best idea...

        return { token, user };
    }

}