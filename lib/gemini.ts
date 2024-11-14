import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction:
    "Respond only with a single line with comma separated values out the following: EDUCATION, HEALTH, FINANCE, MEETINGS, EVENTS, SUBSCRIPTIONS",
});
async function geminiText(body: string) {
  const prompt =
    "Given the mail, tell its categories out of: EDUCATION, HEALTH, FINANCE, MEETINGS, EVENTS, SUBSCRIPTIONS\n" +
    body;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export {geminiText}