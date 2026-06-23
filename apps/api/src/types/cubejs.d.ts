declare module "cubejs" {
  const cubeJs: {
    initSolver: () => void;
    fromString: (facelets: string) => { solve: () => string };
  };
  export = cubeJs;
}
