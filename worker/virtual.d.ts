declare module 'site:catalog' {
  const catalog: {
    formatVersion:1;
    sourceCommit:string;
    builtAt:string;
    files:Record<string,{type:string;body:string}>;
  };
  export default catalog;
}
