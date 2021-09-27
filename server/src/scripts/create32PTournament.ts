import { TournamentModel } from "../database/schemas/tournament";
import { connect, disconnect } from "../database/database";

(async () => {
    connect();
    const tourneys = [
        { name: "32PlayerTournament", organizor: "613b72f284f66dac05aeacea", participants: [
            {name: "Player1", seed: 1}, {name: "Player2", seed: 2}, {name: "Player3", seed: 3}, {name: "Player4", seed: 4},
            {name: "Player5", seed: 5}, {name: "Player6", seed: 6}, {name: "Player7", seed: 7}, {name: "Player8", seed: 8},
            {name: "Player9", seed: 9}, {name: "Player10", seed: 10}, {name: "Player11", seed: 11}, {name: "Player12", seed: 12},
            {name: "Player13", seed: 13}, {name: "Player14", seed: 14}, {name: "Player15", seed: 15}, {name: "Player16", seed: 16},
            {name: "Player17", seed: 17}, {name: "Player18", seed: 18}, {name: "Player19", seed: 19}, {name: "Player20", seed: 20},
            {name: "Player21", seed: 21}, {name: "Player22", seed: 22}, {name: "Player23", seed: 23}, {name: "Player24", seed: 24},
            {name: "Player25", seed: 25}, {name: "Player26", seed: 26}, {name: "Player27", seed: 27}, {name: "Player28", seed: 28},
            {name: "Player29", seed: 29}, {name: "Player30", seed: 30}, {name: "Player31", seed: 31}, {name: "Player32", seed: 32},
        ], doubleElim: true, private: false },
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