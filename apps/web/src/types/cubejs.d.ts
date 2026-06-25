declare module "cubejs" {
  type CubeInstance = {
    asString: () => string;
    cornerParity: () => number;
    edgeParity: () => number;
    move: (algorithm: string) => CubeInstance;
    solve: () => string;
    toJSON: () => {
      center: number[];
      cp: number[];
      co: number[];
      ep: number[];
      eo: number[];
    };
  };

  const Cube: {
    fromString: (facelets: string) => CubeInstance;
    initSolver: () => void;
  };

  export default Cube;
}
