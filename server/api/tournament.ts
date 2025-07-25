import {
    type EventHandlerRequest,
    H3Event,
    type Router,
    createError,
    createRouter,
    eventHandler,
} from "h3";
import {
    type ITournament,
    TournamentPermission,
} from "@shared/interfaces/ITournament";
import { Tournament } from "../model/Tournament";
import { z } from "zod";
import { ensureURLParameter, validateBody } from "../utils/requestValidation";
import { StageController } from "../controller/stages/stageController";
import { TournamentStage } from "../model/TournamentStage";
import { TournamentParticipant } from "../model/TournamentParticipant";
import { ensurePermission, getUserOrFail } from "../utils/auth";
import { GameReport } from "../model/GameReport";
import { StageMatch } from "model/StageMatch";
import { StageParticipant } from "model/StageParticipant";

export class TournamentRouter {
    private readonly stageController: StageController;

    constructor(stageController: StageController) {
        this.stageController = stageController;
    }

    private async createTournament(event: H3Event<EventHandlerRequest>) {
        const user = await getUserOrFail(event);

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
    }

    private async getStageGameGroups(event: H3Event<EventHandlerRequest>) {
        const tournamentId = ensureURLParameter(event, "tournamentId");
        const stageNumber = parseInt(ensureURLParameter(event, "stageNumber"));

        const stage = await TournamentStage.findOneOrFail({
            where: {
                tournamentId: tournamentId,
                stageNumber: stageNumber,
            },
        });

        return stage.groups ?? [];
    }

    private async getStageGames(event: H3Event<EventHandlerRequest>) {
        const tournamentId = ensureURLParameter(event, "tournamentId");
        const stageNumber = parseInt(ensureURLParameter(event, "stageNumber"));

        const matches = await StageMatch.find({
            where: {
                tournamentId: tournamentId,
                stageNumber: stageNumber,
            },
        });
        return matches;
    }

    private async getStagePlacements(event: H3Event<EventHandlerRequest>) {
        const tournamentId = ensureURLParameter(event, "tournamentId");
        const stageNumber = parseInt(ensureURLParameter(event, "stageNumber"));

        const stage = await TournamentStage.findOneOrFail({
            where: {
                tournamentId: tournamentId,
                stageNumber: stageNumber,
            },
            relations: {
                tournament: true,
                participants: true,
                matches: true,
            },
        });

        const stageType = this.stageController.getStageType(stage);
        const placements = stageType.getPlacements();
        return placements.map((placement) => {
            placement.resolve(stage.matches);
            return placement.toString();
        });
    }

    private async getStageParticipants(event: H3Event<EventHandlerRequest>) {
        const tournamentId = ensureURLParameter(event, "tournamentId");
        const stageNumber = parseInt(ensureURLParameter(event, "stageNumber"));

        const participants = await StageParticipant.find({
            where: {
                tournamentId: tournamentId,
                stageNumber: stageNumber,
            },
        });

        return participants;
    }

    private async updateMatchReport(event: H3Event<EventHandlerRequest>) {
        const user = await getUserOrFail(event);
        const tournamentId = ensureURLParameter(event, "tournamentId");
        const stageNumber = parseInt(ensureURLParameter(event, "stageNumber"));

        const tournament = await Tournament.findOneOrFail({
            where: {
                id: tournamentId,
            },
        });

        // TODO: Update permission
        await ensurePermission(tournament, user, TournamentPermission.ADMIN);

        const reportSchema = z
            .object({
                tournamentId: z.string(),
                stageNumber: z.number(),
                matchNumber: z.number(),
                scores: z.array(z.number()),
                ranking: z.array(z.number()),
            })
            .strict();

        const reportData = await validateBody(event, reportSchema);

        if (
            reportData.tournamentId !== tournamentId ||
            reportData.stageNumber !== stageNumber
        ) {
            throw createError({
                statusCode: 400,
                statusMessage: "Body does not match path",
            });
        }

        // TODO: Make sure match ID exists, enough scores are added, etc...

        const matchReport = new GameReport();
        Object.assign(matchReport, reportData);
        await matchReport.save();
        return null;
    }

    private async getStage(event: H3Event<EventHandlerRequest>) {
        const tournamentId = ensureURLParameter(event, "tournamentId");
        const stageNumber = parseInt(ensureURLParameter(event, "stageNumber"));

        const stage = await TournamentStage.findOneOrFail({
            where: {
                tournamentId: tournamentId,
                stageNumber: stageNumber,
            },
        });

        return stage;
    }

    private async updateStage(event: H3Event<EventHandlerRequest>) {
        const user = await getUserOrFail(event);
        const tournamentId = ensureURLParameter(event, "tournamentId");
        const stageNumber = parseInt(ensureURLParameter(event, "stageNumber"));

        const tournament = await Tournament.findOneOrFail({
            where: {
                id: tournamentId,
            },
        });

        // TODO: Update permission
        await ensurePermission(tournament, user, TournamentPermission.ADMIN);

        const stageSchema = z.object({
            stageType: z.string(),
            enrollmentType: z.string(),
        });

        const stageData = await validateBody(event, stageSchema);

        const stage = await TournamentStage.findOneOrFail({
            where: {
                tournamentId: tournamentId,
                stageNumber: stageNumber,
            },
        });

        Object.assign(stage, stageData);
        await stage.save();

        return null;
    }

    private async getAllStages(event: H3Event<EventHandlerRequest>) {
        const tournamentId = ensureURLParameter(event, "tournamentId");

        const stages = await TournamentStage.find({
            where: {
                tournamentId: tournamentId,
            },
        });

        return stages;
    }

    private async createStage(event: H3Event<EventHandlerRequest>) {
        const user = await getUserOrFail(event);
        const tournamentId = ensureURLParameter(event, "tournamentId");

        const tournament = await Tournament.findOneOrFail({
            where: {
                id: tournamentId,
            },
        });

        // TODO: Update permission
        await ensurePermission(tournament, user, TournamentPermission.ADMIN);

        const stageSchema = z
            .object({
                stageNumber: z.number(),
                name: z.string(),
                stageType: z.string(),
                enrollmentType: z.string(),
            })
            .strict();

        const stageData = await validateBody(event, stageSchema);

        if (
            (await TournamentStage.countBy({
                tournamentId: tournamentId,
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
        newStage.tournamentId = tournamentId;
        newStage.groups = [];
        await newStage.save();
        return newStage.stageNumber;
    }

    private async getParticipants(event: H3Event<EventHandlerRequest>) {
        const tournamentId = ensureURLParameter(event, "tournamentId");

        const participants = await TournamentParticipant.find({
            where: {
                tournamentId: tournamentId,
            },
        });

        return participants;
    }

    private async updateParticipant(event: H3Event<EventHandlerRequest>) {
        const user = await getUserOrFail(event);
        const tournamentId = ensureURLParameter(event, "tournamentId");

        const tournament = await Tournament.findOneOrFail({
            where: {
                id: tournamentId,
            },
        });

        // TODO: Update permission
        await ensurePermission(tournament, user, TournamentPermission.ADMIN);

        const participantSchema = z
            .object({
                participantId: z.string().optional(),
                username: z.string(),
            })
            .strict();

        const participantData = await validateBody(event, participantSchema);

        const newParticipant = new TournamentParticipant();
        Object.assign(newParticipant, participantData);
        newParticipant.tournamentId = tournamentId;
        await newParticipant.save();
        return null;
    }

    private async deleteParticipant(event: H3Event<EventHandlerRequest>) {
        const user = await getUserOrFail(event);
        const tournamentId = ensureURLParameter(event, "tournamentId");

        const tournament = await Tournament.findOneOrFail({
            where: {
                id: tournamentId,
            },
        });

        // TODO: Update permission
        await ensurePermission(tournament, user, TournamentPermission.ADMIN);

        const participantSchema = z.object({
            participantId: z.string(),
        });

        const participantData = await validateBody(event, participantSchema);

        const participantToDelete = await TournamentParticipant.findOneOrFail({
            where: {
                tournamentId: tournamentId,
                participantId: participantData.participantId,
            },
        });

        await participantToDelete.remove();
        return null;
    }

    private async getTournament(event: H3Event<EventHandlerRequest>) {
        const tournamentId = ensureURLParameter(event, "tournamentId");

        const tournament = await Tournament.findOneOrFail({
            where: {
                urlName: tournamentId,
            },
            relations: {
                owningUser: true,
            },
        });

        (tournament as ITournament).owningUser =
            tournament.owningUser.toPublicUser();

        return tournament;
    }

    private async getAllTournaments() {
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
    }

    public buildRouter(): Router {
        const router = createRouter();

        router.get(
            "/:tournamentId/stages/:stageNumber/gameGroups",
            eventHandler((event) => this.getStageGameGroups(event)),
        );
        router.get(
            "/:tournamentId/stages/:stageNumber/games",
            eventHandler((event) => this.getStageGames(event)),
        );
        router.get(
            "/:tournamentId/stages/:stageNumber/placements",
            eventHandler((event) => this.getStagePlacements(event)),
        );
        router.get(
            "/:tournamentId/stages/:stageNumber/participants",
            eventHandler((event) => this.getStageParticipants(event)),
        );
        router.patch(
            "/:tournamentId/stages/:stageNumber/reports",
            eventHandler((event) => this.updateMatchReport(event)),
        );
        router.get(
            "/:tournamentId/stages/:stageNumber",
            eventHandler((event) => this.getStage(event)),
        );
        router.patch(
            "/:tournamentId/stages/:stageNumber",
            eventHandler((event) => this.updateStage(event)),
        );
        router.get(
            "/:tournamentId/stages",
            eventHandler((event) => this.getAllStages(event)),
        );
        router.put(
            "/:tournamentId/stages",
            eventHandler((event) => this.createStage(event)),
        );
        router.get(
            "/:tournamentId/participants",
            eventHandler((event) => this.getParticipants(event)),
        );
        router.patch(
            "/:tournamentId/participants",
            eventHandler((event) => this.updateParticipant(event)),
        );
        router.delete(
            "/:tournamentId/participants",
            eventHandler((event) => this.deleteParticipant(event)),
        );
        router.get(
            "/:tournamentId",
            eventHandler((event) => this.getTournament(event)),
        );
        router.get(
            "/",
            eventHandler(() => this.getAllTournaments()),
        );
        router.put(
            "/",
            eventHandler((event) => this.createTournament(event)),
        );

        return router;
    }
}
