import { UserModel } from "../database/schemas/users";
import { connect, disconnect } from "../database/database";
require("dotenv").config();
import * as bcrypt from "bcrypt"

(async () => {
    connect();
    const tourneys = [
        { username: "CurryMaker", passwordHash: bcrypt.hashSync("RecapCurry", 10), permissions: 5, dateOfEntry: new Date(), lastUpdated: new Date() },
        { username: "In4Fun", passwordHash: bcrypt.hashSync("RecapFun", 10), permissions: 4, dateOfEntry: new Date(), lastUpdated: new Date() },
        { username: "GKPunk", passwordHash: bcrypt.hashSync("RecapPunk", 10), permissions: 4, dateOfEntry: new Date(), lastUpdated: new Date() }
    ]
    try {
        for(const tourney of tourneys) {
            await UserModel.create(tourney);
            console.log(`Created tournament ${tourney.username}`);
        }
        disconnect();
    } catch(e) {
        console.error(e);
    }
})();