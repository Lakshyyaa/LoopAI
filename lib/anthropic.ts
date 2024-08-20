// import Anthropic from "@anthropic-ai/sdk";

// const anthropic = new Anthropic();
// export {anthropic}
import Anthropic from "@anthropic-ai/sdk";
const makeAIClient = () => {
  return new Anthropic();
};
declare global {
  var globalClientAI: ReturnType<typeof makeAIClient> | undefined;
}
const anthropic: ReturnType<typeof makeAIClient> =
  globalThis.globalClientAI ?? makeAIClient();
export { anthropic };

if (process.env.NODE_ENV !== "production")
  globalThis.globalClientAI = anthropic;
