declare module "cubejs" {
  type CubeInstance = {
    asString: () => string;
    move: (algorithm: string) => CubeInstance;
    solve: () => string;
    toJSON: () => {
      center: number[];
      cp: number[];
      ep: number[];
      co: number[];
      eo: number[];
    };
    cornerParity: () => number;
    edgeParity: () => number;
  };

  const Cube: {
    fromString: (facelets: string) => CubeInstance;
    initSolver: () => void;
  };

  export default Cube;
}
