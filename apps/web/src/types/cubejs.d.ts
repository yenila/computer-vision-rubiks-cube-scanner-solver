declare module "cubejs" {
  type CubeInstance = {
    asString: () => string;
    move: (algorithm: string) => CubeInstance;
  };

  const Cube: {
    fromString: (facelets: string) => CubeInstance;
  };

  export default Cube;
}
