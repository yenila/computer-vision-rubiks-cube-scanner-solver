import { type AuthUser, type CubeScanState, type SolveResult } from "@rubiks/shared";
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
    getSession: () => Promise<{
        token: string;
        user: AuthUser;
    } | null>;
    onAuthStateChange: (callback: (session: ApiSession | null) => void) => () => void;
    register: (input: {
        email: string;
        password: string;
        name: string;
    }) => Promise<ApiSession>;
    login: (input: {
        email: string;
        password: string;
    }) => Promise<ApiSession>;
    logout: () => Promise<void>;
    solve: (facelets: string) => Promise<SolveResult>;
    listScans: (_token?: string) => Promise<ScanRecord[]>;
    createScan: (_token: string | undefined, input: {
        name: string;
        scan: CubeScanState;
        solution?: SolveResult;
    }) => Promise<ScanRecord>;
    listSolves: (_token?: string) => Promise<SolveRecord[]>;
    createSolve: (_token: string | undefined, input: {
        scanId?: string;
        solution: SolveResult;
        durationMs: number;
    }) => Promise<SolveRecord>;
    leaderboard: () => Promise<{
        id: string;
        rank: number;
        name: string;
        bestTimeMs: number;
        solves: number;
    }[]>;
};
