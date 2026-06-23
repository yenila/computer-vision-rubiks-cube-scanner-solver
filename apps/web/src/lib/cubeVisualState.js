import Cube from "cubejs";
export const SOLVED_FACELETS = "U".repeat(9) + "R".repeat(9) + "F".repeat(9) + "D".repeat(9) + "L".repeat(9) + "B".repeat(9);
const faceOffset = { U: 0, R: 9, F: 18, D: 27, L: 36, B: 45 };
const faceletColors = {
    U: "white",
    R: "red",
    F: "green",
    D: "yellow",
    L: "orange",
    B: "blue"
};
export function applyMovesToFacelets(facelets, moves) {
    if (!/^[URFDLB]{54}$/.test(facelets))
        return SOLVED_FACELETS;
    const cube = Cube.fromString(facelets);
    if (moves.length)
        cube.move(moves.join(" "));
    return cube.asString();
}
export function faceletColor(facelets, face, index) {
    const symbol = facelets[faceOffset[face] + index];
    return symbol ? faceletColors[symbol] : faceletColors[face];
}
export function stickerIndex(face, x, y, z) {
    switch (face) {
        case "U": return (z + 1) * 3 + (x + 1);
        case "R": return (1 - y) * 3 + (1 - z);
        case "F": return (1 - y) * 3 + (x + 1);
        case "D": return (1 - z) * 3 + (x + 1);
        case "L": return (1 - y) * 3 + (z + 1);
        case "B": return (1 - y) * 3 + (1 - x);
    }
}
