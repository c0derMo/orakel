import { Schema, Document, Model, model, Types } from 'mongoose';
import { hasPermission, Permissions } from '../../lib/auth';

//region Interfaces
interface IParticipant {
    name: string;
    associatedUserId?: Types.ObjectId;
}

interface IBracketParticipant extends IParticipant {
    seed: number;
}

interface IMatch {
    id: string;
    score1: number;
    score2: number;
}

interface IBracket {
    type: string;
    participants: IBracketParticipant[];
    matches: IMatch[];
}

interface ITournament {
    name: string;
    organizor: string;
    participants: IParticipant[];
    private: boolean;
    brackets: {
        [key: string]: IBracket
    };
    admins?: string[];
}

interface ITournamentDocument extends ITournament, Document {
    addParticipant: (this: ITournamentDocument, name: string) => Promise<void>;
    reseedRandomly: (this: ITournamentDocument) => Promise<void>;
    getParticipantBySeed: (this: ITournamentDocument, seed: number) => Promise<string>;
    setParticipants: (this: ITournamentDocument, participants: IParticipant[]) => Promise<boolean>;
    updateMatch: (this: ITournamentDocument, matchId: string, score1: number, score2: number, userId: string) => Promise<void>;
    hasPermissions: (this: ITournamentDocument, userId: string) => Promise<boolean>;
}

interface ITournamentModel extends Model<ITournamentDocument> {
    findOneOrCreate: (name: string, userId?: Types.ObjectId) => Promise<ITournamentDocument>;
}
//endregion

//region schema definition
const TournamentSchema = new Schema({
    name: String,
    organizor: String,
    participants: [{ name: String, associatedUserId: { type: Types.ObjectId, required: false }}],
    brackets: { type: Map, of: {
        type: { type: String }, matches: [
            { id: String, score1: Number, score2: Number }
        ], participants: [
            { name: String, seed: Number, associatedUserId: { type: Types.ObjectId, required: false }}
        ]
    }},
    private: Boolean,
    admins: [String]
});

TournamentSchema.methods.addParticipant = addParticipant;
TournamentSchema.methods.reseedRandomly = reseedRandomly;
TournamentSchema.methods.setParticipants = setParticipants;
TournamentSchema.methods.getParticipantBySeed = getParticipantBySeed;
TournamentSchema.methods.updateMatch = updateMatch;
TournamentSchema.methods.hasPermissions = hasPermissions;

TournamentSchema.statics.findOneOrCreate = findOneOrCreate;
//endregion

async function setParticipants(this: ITournamentDocument, participants: IParticipant[]): Promise<void> {
    this.participants = participants;
    await this.save();
}

async function addParticipant(this: ITournamentDocument, name: string): Promise<void> {
    const user = {
        name: name,
        associatedUserID: undefined
    }
    this.participants.push(user);
    await this.save();
}

async function reseedRandomly(this: ITournamentDocument, bracketName: string): Promise<boolean> {
    const bracket = this.brackets[bracketName];
    if (!bracket) {
        return false;
    }
    const seeds = Array.from({ length: bracket.participants.length }, (_, i) => i + 1);
    bracket.participants.forEach(e => {
        const rand = Math.floor((Math.random() * seeds.length));
        e.seed = seeds.splice(rand, 1)[0];
    });
    await this.save();
    return true;
}

function getParticipantBySeed(this: ITournamentDocument, bracketName: string, seed: number): string {
    const bracket = this.brackets[bracketName];
    if (!bracket) {
        return "";
    }
    const part = bracket.participants.find(e => { return e.seed === seed });
    if(part) {
        return part.name;
    } else {
        return "BYE";
    }
}

async function updateMatch(this: ITournamentDocument, bracketName: string, matchId: string, score1: number, score2: number, userId: string): Promise<void> {
    if(!await this.hasPermissions(userId)) return;
    const bracket = this.brackets[bracketName];
    if (!bracket) {
        return;
    }
    const match = bracket.matches.find(e => { return e.id === matchId });
    if(match) {
        match.score1 = score1;
        match.score2 = score2;
    } else {
        bracket.matches.push({
            id: matchId,
            score1: score1,
            score2: score2
        });
    }
    await this.save();
}

async function hasPermissions(this: ITournamentDocument, userId: string): Promise<boolean> {
    if(this.organizor === userId) return true;
    if(this.admins.includes(userId)) return true;
    return await hasPermission(userId, Permissions.ROOT) || await hasPermission(userId, Permissions.ADMINISTRATOR);
}

async function findOneOrCreate(name: string, userId?: Types.ObjectId): Promise<ITournamentDocument> {
    const record = await TournamentModel.findOne({ name: name }).exec();
    if(record) {
        return record;
    } else {
        if(userId) {
            return await TournamentModel.create({name: name, organizor: userId});
        } else {
            return await TournamentModel.create({name: name, organizor: undefined});
        }
    }
}

export const TournamentModel = model<ITournamentDocument>("tournament", TournamentSchema) as ITournamentModel;
