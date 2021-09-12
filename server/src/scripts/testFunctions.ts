import { connect, disconnect } from "../database/database";

(async() => {
    const db = connect();

    let reseedTourney = await db.TournamentModel.findOneOrCreate("TournamentForReseeding");
    await reseedTourney.reseedRandomly();

    let pushTourney = await db.TournamentModel.findOneOrCreate("TournamentForPushing");
    await pushTourney.addParticipant("Yes", 1);

    disconnect();
})();