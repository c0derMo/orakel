import { ITournamentBracket } from "../model/Tournament";
import {SingleEliminationBracketBuilder} from "./bracketBuilders/singleElimination";
import {DoubleEliminationBracketBuilder} from "./bracketBuilders/doubleElimination";

export interface BracketBuilder {
    constructBracket(bracketInfo: ITournamentBracket): unknown
}

type BracketBuilderList = {
    [type: string]: BracketBuilder
}

const bracketBuilders: BracketBuilderList = {
    "singleElimination": new SingleEliminationBracketBuilder(),
    "doubleElimination": new DoubleEliminationBracketBuilder()
}

export function constructBracket(bracketInfo: ITournamentBracket): unknown {
    return bracketBuilders[bracketInfo.type].constructBracket(bracketInfo);
}
