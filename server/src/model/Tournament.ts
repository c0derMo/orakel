import { hasPermission, Permissions } from "../lib/auth";

export interface ITournament {
    name: string;
    organizor: string;
    private: boolean;
    participants: ITournamentParticipant[];
    brackets: { [key: string]: ITournamentBracket; };
    administrators: string[];
}

export interface ITournamentParticipant {
    name: string;
    associatedUserId?: string;
}

export interface ITournamentBracket {
    type: string;
    participants: ITournamentParticipant[];
    matches: ITournamentMatch[];
}

export interface ITournamentMatch {
    id: string;
    score1: number;
    score2: number;
}


export abstract class Tournament {
    name: string;
    organizor: string;
    private: boolean;
    participants: ITournamentParticipant[];
    brackets: { [key: string]: ITournamentBracket };
    administrators: string[];


    constructor(info: ITournament) {
        this.name = info.name;
        this.organizor = info.organizor;
        this.private = info.private;
        this.participants = info.participants;
        this.brackets = info.brackets;
        this.administrators = info.administrators;
    }

    abstract save();

    /**
     * Reseeds the bracket with the given name randomly
     * @param bracketName Bracket identifier to reseed
     */
    async reseedRandomly(bracketName: string): Promise<boolean> {
        const bracket = this.brackets[bracketName];
        if (!bracket) {
            return false;
        }
        let currentIndex = bracket.participants.length;
        let randomIndex: number;
        // While there remain elements to shuffle...
        while (currentIndex !== 0) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            // And swap it with the current element.
            [bracket.participants[currentIndex], bracket.participants[randomIndex]] = [
                bracket.participants[randomIndex], bracket.participants[currentIndex]];
        }
        await this.save();
        return true;
    }

    /**
     * Returns the participant of the bracket at the given index
     * @param bracketName Bracket to fetch participants from
     * @param index Index of the participant to fetch
     */
    getParticipantByBracketIndex(bracketName: string, index: number): ITournamentParticipant {
        const bracket = this.brackets[bracketName];
        if (!bracket) {
            return undefined;
        }
        if (index >= bracket.participants.length || index < 0) {
            return undefined;
        } else {
            return bracket.participants[index];
        }
    }

    /**
     * Updates a match in the bracket
     * @param bracketName Bracket to update
     * @param matchInfo Match to update
     */
    async updateMatch(bracketName: string, matchInfo: ITournamentMatch): Promise<boolean> {
        const bracket = this.brackets[bracketName];
        if (!bracket) {
            return false;
        }
        const match = bracket.matches.find(e => { return e.id === matchInfo.id });
        if (match) {
            match.score1 = matchInfo.score1;
            match.score2 = matchInfo.score2;
        } else {
            bracket.matches.push(matchInfo);
        }
        await this.save();
        return;
    }

    /**
     * Checks if the given userId has permissions to update this tournament
     * @param userId UserId to check for
     */
    async hasPermissions(userId: string): Promise<boolean> {
        if (this.organizor === userId) return true;
        if (this.administrators.includes(userId)) return true;
        return await hasPermission(userId, Permissions.ROOT) || await hasPermission(userId, Permissions.ADMINISTRATOR);
    }
}
