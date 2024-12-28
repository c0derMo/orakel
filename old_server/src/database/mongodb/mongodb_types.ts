import {Tournament} from "../../model/Tournament";
import {ITournamentDocument} from "./schemas/tournament";
import {User} from "../../model/User";
import {IUserDocument} from "./schemas/users";
import {Types} from "mongoose";

export class MongoTournament extends Tournament {
    private mongoDocument: ITournamentDocument;

    constructor(mongoDocument: ITournamentDocument) {
        super({
            name: mongoDocument.name,
            organizor: mongoDocument.organizor,
            private: mongoDocument.private,
            participants: mongoDocument.participants,
            brackets: mongoDocument.brackets,
            administrators: mongoDocument.admins
        });
        this.mongoDocument = mongoDocument;
    }

    async save(): Promise<void> {
        this.mongoDocument.name = this.name;
        this.mongoDocument.organizor = this.organizor;
        this.mongoDocument.private = this.private;
        this.mongoDocument.participants = this.participants;
        this.mongoDocument.brackets = this.brackets;
        this.mongoDocument.admins = this.administrators;
        await this.mongoDocument.save();
    }
}

export class MongoUser extends User {
    private mongoDocument: IUserDocument;

    constructor(mongoDocument: IUserDocument) {
        super({
            id: (mongoDocument._id as Types.ObjectId).toString(),
            username: mongoDocument.username,
            passwordHash: mongoDocument.passwordHash,
            permissions: mongoDocument.permissions,
            registrationDate: mongoDocument.dateOfEntry,
            lastUpdated: mongoDocument.lastUpdated
        });

        this.mongoDocument = mongoDocument;
    }

    async save(): Promise<void> {
        this.mongoDocument.username = this.username;
        this.mongoDocument.passwordHash = this.passwordHash;
        this.mongoDocument.permissions = this.permissions;
        this.mongoDocument.dateOfEntry = this.registrationDate;
        this.mongoDocument.lastUpdated = this.lastUpdated;
        await this.mongoDocument.save();
    }
}
