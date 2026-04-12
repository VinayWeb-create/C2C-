import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There isn't a direct listModels in the SDK but let's try to verify the key with a simple request
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("test");
    console.log("SUCCESS: gemini-pro is working.");
    console.log("Response:", result.response.text());
  } catch (err) {
    console.error("FAILURE: Error testing key/model:");
    console.error(err.message);
    if (err.message.includes("API key not valid")) {
      console.error("TIP: Your GEMINI_API_KEY appears to be invalid. Please check Google AI Studio.");
    }
  }
}

listModels();
