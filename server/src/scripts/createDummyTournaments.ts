import { TournamentModel } from "../database/schemas/tournament";
import { connect, disconnect } from "../database/database";

(async () => {
    connect();
    const tourneys = [
        { name: "FirstTestTournament", organizor: undefined, participants: [{name: "Player1", seed: 1}, {name: "Player2", seed: 2}, {name: "Player3", seed: 3}, {name: "Player4", seed: 4}] },
        { name: "TournamentForReseeding", organizor: undefined, participants: [{name: "Player1", seed: 1}, {name: "Player2", seed: 2}, {name: "Player3", seed: 3}, {name: "Player4", seed: 4}] },
        { name: "TournamentForPushing", organizor: undefined, participants: [] },
    ]
    try {
        for(const tourney of tourneys) {
            await TournamentModel.create(tourney);
            console.log(`Created tournament ${tourney.name}`);
        }
        disconnect();
    } catch(e) {
        console.error(e);
    }
})();