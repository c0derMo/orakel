import EventEmitter from "events";
import { Tournament } from "../model/Tournament";
import { TournamentParticipant } from "../model/TournamentParticipant";
import { TournamentStage } from "../model/TournamentStage";
import { StageParticipant } from "../model/StageParticipant";
import {
    type EntitySubscriberInterface,
    EventSubscriber,
    type InsertEvent,
    type RemoveEvent,
    type UpdateEvent,
} from "typeorm";
import { DatabaseController } from "./databaseController";
import { GameReport } from "model/GameReport";

interface DatabaseEvents<T> {
    inserted: [entity?: T];
    updated: [entity?: T, changedColumns?: (keyof T)[]];
    removed: [entity?: T];
}

export class DatabaseListener {
    tournament: EventEmitter<DatabaseEvents<Tournament>>;
    tournamentParticipant: EventEmitter<DatabaseEvents<TournamentParticipant>>;
    tournamentStage: EventEmitter<DatabaseEvents<TournamentStage>>;
    stageParticipant: EventEmitter<DatabaseEvents<StageParticipant>>;
    gameReport: EventEmitter<DatabaseEvents<GameReport>>;

    constructor() {
        this.tournament = new EventEmitter();
        this.tournamentParticipant = new EventEmitter();
        this.tournamentStage = new EventEmitter();
        this.stageParticipant = new EventEmitter();
        this.gameReport = new EventEmitter();
    }

    addListenersToDatabase(database: DatabaseController) {
        database.addSubscriber(
            buildDatabaseSubscriber(Tournament, this.tournament),
        );
        database.addSubscriber(
            buildDatabaseSubscriber(
                TournamentParticipant,
                this.tournamentParticipant,
            ),
        );
        database.addSubscriber(
            buildDatabaseSubscriber(TournamentStage, this.tournamentStage),
        );
        database.addSubscriber(
            buildDatabaseSubscriber(StageParticipant, this.stageParticipant),
        );
        database.addSubscriber(
            buildDatabaseSubscriber(GameReport, this.gameReport),
        );
    }
}

function buildDatabaseSubscriber<T>(
    entity: new () => T,
    emitter: EventEmitter<DatabaseEvents<T>>,
): new () => EntitySubscriberInterface<T> {
    @EventSubscriber()
    class DatabaseSubscriber implements EntitySubscriberInterface<T> {
        listenTo() {
            return entity;
        }

        afterInsert(event: InsertEvent<T>) {
            emitter.emit("inserted", event.entity);
        }

        beforeRemove(event: RemoveEvent<T>): void {
            emitter.emit("removed", event.databaseEntity);
        }

        afterUpdate(event: UpdateEvent<T>): void {
            emitter.emit(
                "updated",
                event.entity as T,
                event.updatedColumns.map((c) => c.propertyName) as (keyof T)[],
            );
        }
    }
    return DatabaseSubscriber;
}
