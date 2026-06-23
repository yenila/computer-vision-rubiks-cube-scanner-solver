const faceDetails = {
    U: { name: "top", color: "white", viewpoint: "Look directly down at the white top face." },
    R: { name: "right", color: "red", viewpoint: "Look directly at the red right face." },
    F: { name: "front", color: "green", viewpoint: "Look directly at the green front face." },
    D: { name: "bottom", color: "yellow", viewpoint: "Judge the direction while looking directly at the yellow bottom face." },
    L: { name: "left", color: "orange", viewpoint: "Look directly at the orange left face." },
    B: { name: "back", color: "blue", viewpoint: "Judge the direction while looking directly at the blue back face." }
};
export function describeMove(move) {
    const face = move[0];
    const details = faceDetails[face];
    const isDouble = move.endsWith("2");
    const isCounterclockwise = move.endsWith("'");
    const direction = isDouble ? "180 degrees" : isCounterclockwise ? "counterclockwise" : "clockwise";
    const amount = isDouble ? "180°" : `90° ${direction}`;
    return {
        face,
        faceName: details.name,
        centerColor: details.color,
        direction,
        degrees: isDouble ? 180 : 90,
        instruction: `Turn the ${details.color} ${details.name} face ${amount}.`,
        viewpoint: details.viewpoint
    };
}
