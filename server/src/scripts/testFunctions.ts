import { connect, disconnect } from "../database/mongodb/database";
import { encodePermissions, hasPermission, Permissions } from "../routers/authenticator";
require("dotenv").config();

(async() => {
    const db = await connect();

    let reseedTourney = await db.TournamentModel.findOneOrCreate("RRWC2021 - Actual tournament");
    console.log(Object.keys(Permissions).length);
    console.log(await reseedTourney.hasPermissions("6193ca690b7cae9d4c04c869")); // 6193ca690b7cae9d4c04c864
    console.log(await hasPermission("6193ca690b7cae9d4c04c869", Permissions.ADMINISTRATOR));
    console.log(await hasPermission("6193ca690b7cae9d4c04c869", Permissions.ROOT));

    disconnect();
})();
