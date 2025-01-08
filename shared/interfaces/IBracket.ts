export interface IBracket {
    tournamentId: string;
    name: string;
    type: string;
    enrollmentConfig: IBracketEnrollmentConfig;
}

export interface IBracketEnrollmentConfig {
    enrollmentType: string;
    [key: string]: unknown;
}