import { Schema, Document, Model, model, Types } from 'mongoose';

//region Interfaces
interface IParticipant {
    name: string;
    associatedUserId?: string;
}

interface IMatch {
    id: string;
    score1: number;
    score2: number;
}

interface IBracket {
    type: string;
    participants: IParticipant[];
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

export interface ITournamentDocument extends ITournament, Document {
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
    participants: [{ name: String, associatedUserId: { type: String, required: false }}],
    brackets: { type: Map, of: {
        type: { type: String }, matches: [
            { id: String, score1: Number, score2: Number }
        ], participants: [
            { name: String, associatedUserId: { type: String, required: false }}
        ]
    }},
    private: Boolean,
    admins: [String]
});

TournamentSchema.methods.addParticipant = addParticipant;
TournamentSchema.methods.setParticipants = setParticipants;

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
