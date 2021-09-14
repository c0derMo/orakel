import { Schema, Document, Model, model } from "mongoose";

interface IUser {
    username: String;
    displayname: String;
    passwordHash: string;
    permissions: number;
    dateOfEntry?: Date;
    lastUpdated?: Date;
}

export interface IUserDocument extends IUser, Document {
    setLastUpdated: (this: IUserDocument) => Promise<void>;
}
interface IUserModel extends Model<IUserDocument> {
    findOneOrCreate: ({ username, displayname }: {username: string, displayname: string}) => Promise<IUserDocument>;
}

const UserSchema = new Schema({
    username: String,
    displayname: String,
    passwordHash: String,
    permissions: Number,
    dateOfEntry: {
        type: Date,
        default: new Date()
    },
    lastUpdated: {
        type: Date,
        default: new Date()
    }
});

UserSchema.statics.findOneOrCreate = findOneOrCreate;

UserSchema.methods.setLastUpdated = setLastUpdated;

export async function setLastUpdated(this: IUserDocument): Promise<void> {
    const n = new Date();
    if(!this.lastUpdated || this.lastUpdated < n) {
        this.lastUpdated = n;
        await this.save;
    }
}

export async function findOneOrCreate(username: string): Promise<IUserDocument> {
    const record = await this.findOne({username});
    if(record) {
        return record;
    } else {
        return null;
    }
}

export const UserModel = model<IUserDocument>("user", UserSchema);