import { UserModel } from "../database/schemas/users";
import { connect, disconnect } from "../database/database";

(async () => {
    connect();
    const tourneys = [
        { username: "currymaker", displayname: "CurryMaker", passwordHash: "abc123", permissions: 2, dateOfEntry: new Date(), lastUpdated: new Date() },
        { username: "in4fun", displayname: "In4Fun", passwordHash: "abc123", permissions: 1, dateOfEntry: new Date(), lastUpdated: new Date() }
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