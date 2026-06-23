export const FACE_ORDER = ["U", "R", "F", "D", "L", "B"] as const;
export const COLOR_ORDER = ["white", "red", "green", "yellow", "orange", "blue"] as const;

export type CubeFace = (typeof FACE_ORDER)[number];
export type CubeColor = (typeof COLOR_ORDER)[number];

export type Rgb = { r: number; g: number; b: number };

export type Sticker = {
  color: CubeColor;
  confidence: number;
  source: "detected" | "manual";
  rgb?: Rgb;
};

export type FaceScan = {
  face: CubeFace;
  stickers: Sticker[];
  capturedAt: string;
};

export type CubeScanState = Record<CubeFace, FaceScan | null>;

export type ValidationIssue = {
  code:
    | "MISSING_FACE"
    | "BAD_STICKER_COUNT"
    | "CENTER_DUPLICATE"
    | "CENTER_MISSING"
    | "COLOR_COUNT";
  message: string;
  face?: CubeFace;
  color?: CubeColor;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

export type MoveToken =
  | "U"
  | "U'"
  | "U2"
  | "R"
  | "R'"
  | "R2"
  | "F"
  | "F'"
  | "F2"
  | "D"
  | "D'"
  | "D2"
  | "L"
  | "L'"
  | "L2"
  | "B"
  | "B'"
  | "B2";

export type SolveResult = {
  moves: MoveToken[];
  notation: string;
  estimatedTurns: number;
  facelets: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};
