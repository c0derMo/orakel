import { TournamentModel } from "../database/mongodb/schemas/tournament";
import { connect, disconnect } from "../database/mongodb/database";
require("dotenv").config();

// CurryUID 6193ca690b7cae9d4c04c864
//  PunkUID 6193ca690b7cae9d4c04c869
//   FunUID 6193ca690b7cae9d4c04c867

(async () => {
    connect();
    const tourneys = [
        { name: "Roulette Recap - GKPunk's Prediction", organizor: "6193ca690b7cae9d4c04c869", participants: [
            {name: "In4Fun", seed: 1}, {name: "Ducker", seed: 2}, {name: "Frote7", seed: 3}, {name: "k-kaneta", seed: 4},
            {name: "ChrisX3", seed: 5}, {name: "T_Nort23", seed: 6}, {name: "DaniButa", seed: 7}, {name: "IlikeHitman", seed: 8},
            {name: "Pigiero", seed: 9}, {name: "Yannini", seed: 10}, {name: "ChromeX", seed: 11}, {name: "AgentMando", seed: 12},
            {name: "Blithe", seed: 13}, {name: "Rommel", seed: 14}, {name: "Papierfresse", seed: 15}, {name: "MrMike", seed: 16},
            {name: "SomRandomPerson", seed: 17}, {name: "Agent 420", seed: 18}, {name: "JoeBabyGrabber", seed: 19}, {name: "linux_penguin", seed: 20},
            {name: "Fuzk", seed: 21}, {name: "Speedster", seed: 22}, {name: "The_Buff_Guy", seed: 23}, {name: "JohnnyAxXx", seed: 24},
            {name: "Crewdy", seed: 25}, {name: "CurryMaker", seed: 26}, {name: "Meme Junkie", seed: 27}, {name: "KOats", seed: 28},
            {name: "PapaLevy", seed: 29}, {name: "mikulers", seed: 30}, {name: "Brainfixer", seed: 31}, {name: "davidredsox", seed: 32},
        ], doubleElim: true, private: false, admins: ["6193ca690b7cae9d4c04c864"] },
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
