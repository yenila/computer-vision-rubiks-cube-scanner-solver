import type { AuthUser, CubeScanState, SolveResult } from "@rubiks/shared";
export type ApiSession = {
    token: string;
    user: AuthUser;
};
export type ScanRecord = {
    id: string;
    name: string;
    status: "VALID" | "INVALID" | "SOLVED";
    createdAt: string;
    scan: CubeScanState;
};
export type SolveRecord = {
    id: string;
    scanId?: string;
    solution: SolveResult;
    durationMs: number;
    createdAt: string;
};
export type LeaderboardEntry = {
    id: string;
    rank: number;
    name: string;
    bestTimeMs: number;
    solves: number;
};
export declare const api: {
    register: (input: {
        email: string;
        password: string;
        name: string;
    }) => Promise<ApiSession>;
    login: (input: {
        email: string;
        password: string;
    }) => Promise<ApiSession>;
    solve: (facelets: string) => Promise<SolveResult>;
    listScans: (token: string) => Promise<ScanRecord[]>;
    createScan: (token: string, input: {
        name: string;
        scan: CubeScanState;
        solution?: SolveResult;
    }) => Promise<ScanRecord>;
    listSolves: (token: string) => Promise<SolveRecord[]>;
    createSolve: (token: string, input: {
        scanId?: string;
        solution: SolveResult;
        durationMs: number;
    }) => Promise<SolveRecord>;
    leaderboard: () => Promise<LeaderboardEntry[]>;
};
