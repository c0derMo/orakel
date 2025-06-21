import { type Router, createRouter, eventHandler } from "h3";
import { StageController } from "../controller/stages/stageController";

export function buildDataRouter(stageController: StageController): Router {
    const dataRouter = createRouter();

    dataRouter.get(
        "/stageTypes",
        eventHandler(() => {
            return stageController.getStageTypes();
        }),
    );

    dataRouter.get(
        "/enrollmentConfigs",
        eventHandler(() => {
            return stageController.getEnrollmentConfigs();
        }),
    );

    return dataRouter;
}
