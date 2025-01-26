import { Router, createError, createRouter, eventHandler } from "h3";
import { getUser } from "../controller/authController";
import { ITournament } from "@shared/interfaces/ITournament";
import { Tournament } from "../model/Tournament";
import { z } from "zod";
import { validateBody } from "../utils/bodyValidation";
import { StageController } from "../controller/stages/stageController";
import { TournamentStage } from "../model/TournamentStage";
import { TournamentParticipant } from "../model/TournamentParticipant";

export function buildTournamentRouter(
    stageController: StageController,
): Router {
    const tournamentRouter = createRouter();

    tournamentRouter.put(
        "/",
        eventHandler(async (event) => {
            const user = await getUser(event);

            if (user == null) {
                throw createError({
                    statusCode: 403,
                });
            }

            const tournamentSchema = z
                .object({
                    urlName: z.string(),
                    name: z.string(),
                    private: z.boolean(),
                })
                .strict();

            const tournamentData = await validateBody(event, tournamentSchema);

            // TODO: Validate url is unique, etc.

            const tournament = new Tournament();
            Object.assign(tournament, tournamentData);
            tournament.owningUser = user;
            await tournament.save();
            return tournament.id;
        }),
    );

    tournamentRouter.get(
        "/:tournamentId/stages/:stageNumber/gameGroups",
        eventHandler(async (event) => {
            if (
                event.context.params?.tournamentId == null ||
                event.context.params?.stageNumber == null
            ) {
                throw createError({ statusCode: 400 });
            }

            const stage = await TournamentStage.findOne({
                where: {
                    tournamentId: event.context.params.tournamentId,
                    stageNumber: parseInt(event.context.params.stageNumber),
                },
                relations: {
                    participants: true,
                    reportedGames: true,
                },
            });

            if (stage == null) {
                throw createError({ statusCode: 404 });
            }

            return stageController
                .getStageType(stage.type)
                .getGameGroups(stage);
        }),
    );

    tournamentRouter.get(
        "/:tournamentId/stages/:stageNumber/games",
        eventHandler(async (event) => {
            if (
                event.context.params?.tournamentId == null ||
                event.context.params?.stageNumber == null
            ) {
                throw createError({ statusCode: 400 });
            }

            const stage = await TournamentStage.findOne({
                where: {
                    tournamentId: event.context.params.tournamentId,
                    stageNumber: parseInt(event.context.params.stageNumber),
                },
                relations: {
                    participants: true,
                    reportedGames: true,
                },
            });

            if (stage == null) {
                throw createError({ statusCode: 404 });
            }

            return stageController.getStageType(stage.type).getGames(stage);
        }),
    );

    tournamentRouter.get(
        "/:tournamentId/stages",
        eventHandler(async (event) => {
            if (event.context.params?.tournamentId == null) {
                throw createError({ statusCode: 400 });
            }

            const stages = await TournamentStage.find({
                where: {
                    tournamentId: event.context.params.tournamentId,
                },
            });

            return stages;
        }),
    );

    tournamentRouter.put(
        "/:tournamentId/stages",
        eventHandler(async (event) => {
            if (event.context.params?.tournamentId == null) {
                throw createError({ statusCode: 400 });
            }

            const stageSchema = z
                .object({
                    stageNumber: z.number(),
                    name: z.string(),
                    type: z.string(),
                    enrollmentConfig: z.object({}),
                })
                .strict();

            const stageData = await validateBody(event, stageSchema);

            if (
                (await TournamentStage.countBy({
                    tournamentId: event.context.params.tournamentId,
                    stageNumber: stageData.stageNumber,
                })) > 0
            ) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Stage number already exists",
                });
            }

            const newStage = new TournamentStage();
            Object.assign(newStage, stageData);
            newStage.tournamentId = event.context.params.tournamentId;
            await newStage.save();
            return newStage.stageNumber;
        }),
    );

    tournamentRouter.get(
        "/:tournamentId/participants",
        eventHandler(async (event) => {
            if (event.context.params?.tournamentId == null) {
                throw createError({ statusCode: 400 });
            }

            const participants = await TournamentParticipant.find({
                where: {
                    tournamentId: event.context.params.tournamentId,
                },
            });

            return participants;
        }),
    );

    tournamentRouter.patch(
        "/:tournamentId/participants",
        eventHandler(async (event) => {
            // TODO: Check for authorization
            if (event.context.params?.tournamentId == null) {
                throw createError({ statusCode: 400 });
            }

            const participantSchema = z
                .object({
                    participantId: z.string().optional(),
                    username: z.string(),
                })
                .strict();

            const participantData = await validateBody(
                event,
                participantSchema,
            );

            const newParticipant = new TournamentParticipant();
            Object.assign(newParticipant, participantData);
            newParticipant.tournamentId = event.context.params.tournamentId;
            await newParticipant.save();
            return null;
        }),
    );

    tournamentRouter.delete(
        "/:tournamentId/participants",
        eventHandler(async (event) => {
            // TODO: Check for authorization
            if (event.context.params?.tournamentId == null) {
                throw createError({ statusCode: 400 });
            }

            const participantSchema = z.object({
                participantId: z.string(),
            });

            const participantData = await validateBody(
                event,
                participantSchema,
            );

            const participantToDelete = await TournamentParticipant.findOne({
                where: {
                    tournamentId: event.context.params.tournamentId,
                    participantId: participantData.participantId,
                },
            });

            if (participantToDelete == null) {
                throw createError({
                    statusCode: 404,
                });
            }

            await participantToDelete.remove();
            return null;
        }),
    );

    tournamentRouter.get(
        "/:tournamentId",
        eventHandler(async (event) => {
            if (event.context.params?.tournamentId == null) {
                throw createError({ statusCode: 400 });
            }

            const tournament = await Tournament.findOne({
                where: {
                    urlName: event.context.params.tournamentId,
                },
                relations: {
                    owningUser: true,
                },
            });
            if (tournament == null) {
                throw createError({ statusCode: 404 });
            }

            (tournament as ITournament).owningUser =
                tournament.owningUser.toPublicUser();

            return tournament;
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

    return tournamentRouter;
}
