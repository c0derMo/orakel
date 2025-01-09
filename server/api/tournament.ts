import { createError, createRouter, eventHandler, readBody } from "h3";
import { getUser } from "../controller/authController";
import { ITournament } from "@shared/interfaces/ITournament";
import { Tournament } from "../model/Tournament";

export const tournamentRouter = createRouter();

tournamentRouter.put(
    "/",
    eventHandler(async (event) => {
        const user = await getUser(event);

        if (user == null) {
            throw createError({
                statusCode: 403,
            });
        }

        // TODO: Validate body
        const tournamentData = await readBody<Partial<ITournament>>(event);

        // TODO: Validate url is unique, etc.

        const tournament = new Tournament();
        Object.assign(tournament, tournamentData);
        tournament.owningUser = user;
        await tournament.save();
        return tournament.id;
    }),
);

tournamentRouter.get(
    "/",
    eventHandler(async () => {
        const tournaments = await Tournament.find({
            relations: {
                owningUser: true,
            },
        });

        tournaments.map<ITournament>((tournament) => {
            (tournament as ITournament).owningUser =
                tournament.owningUser.toPublicUser();
            return tournament;
        });

        return tournaments;
    }),
);
