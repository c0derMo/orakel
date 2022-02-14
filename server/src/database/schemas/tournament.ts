import { Schema, Document, Model, model, Types } from 'mongoose';
import { hasPermission, Permissions } from '../../routers/authenticator';

interface IParticipant {
    name: string;
    seed: number;
    associatedUserId?: Types.ObjectId;
}

interface ITournament {
    name: string;
    organizor: string;
    participants: IParticipant[];
    matches: {id: string, score1: number, score2: number}[];
    private: boolean;
    doubleElim?: boolean;
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

const TournamentSchema = new Schema({
    name: String,
    organizor: String,
    participants: [{ name: String, seed: Number, associatedUserId: { type: Types.ObjectId, required: false }}],
    matches: [{id: String, player1: String, player2: String, score1: Number, score2: Number}],
    private: Boolean,
    doubleElim: Boolean,
    admins: [String]
});

TournamentSchema.methods.addParticipant = addParticipant;
TournamentSchema.methods.reseedRandomly = reseedRandomly;
TournamentSchema.methods.setParticipants = setParticipants;
TournamentSchema.methods.getParticipantBySeed = getParticipantBySeed;
TournamentSchema.methods.updateMatch = updateMatch;
TournamentSchema.methods.hasPermissions = hasPermissions;

TournamentSchema.statics.findOneOrCreate = findOneOrCreate;

function setParticipants(this: ITournamentDocument, participants: IParticipant[]): boolean {
    const seeds = [];
    let ok = true;
    participants.forEach(e => {
        if(seeds.includes(e.seed)) {
            ok = false;
        } else {
            seeds.push(e.seed);
        }
    });
    if(!ok) {
        return false;
    }
    this.participants = participants;
    return true;
}

async function addParticipant(this: ITournamentDocument, name: string): Promise<void> {
    const user = {
        name: name,
        seed: this.participants.length+1,
        associatedUserID: undefined
    }
    this.participants.push(user);
    await this.save();
}

async function reseedRandomly(this: ITournamentDocument): Promise<void> {
    const seeds = Array.from({length: this.participants.length}, (_, i) => i + 1)
    this.participants.forEach(e => {
        const rand = Math.floor((Math.random() * seeds.length));
        e.seed = seeds.splice(rand, 1)[0];
    });
    await this.save();
}

function getParticipantBySeed(this: ITournamentDocument, seed: number): string {
    const part = this.participants.find(e => { return e.seed === seed });
    if(part) {
        return part.name;
    } else {
        return "BYE";
    }
}

async function updateMatch(this: ITournamentDocument, matchId: string, score1: number, score2: number, userId: string): Promise<void> {
    if(!await this.hasPermissions(userId)) return;
    const match = this.matches.find(e => { return e.id === matchId });
    if(match) {
        match.score1 = score1;
        match.score2 = score2;
    } else {
        this.matches.push({
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
    if(await hasPermission(userId, Permissions.ROOT) || await hasPermission(userId, Permissions.ADMINISTRATOR)) return true;
    return false;
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
