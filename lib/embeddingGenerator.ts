import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);
export const getEmbedding = async (text: string) => {
  try {
    const response = await hf.featureExtraction({
      model: "intfloat/multilingual-e5-large",
      inputs: text,
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};
