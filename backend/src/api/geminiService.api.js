import { GoogleGenerativeAI } from "@google/generative-ai";

console.log(process.env.GEMIMI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMIMI_API_KEY);

async function predictCategory(description) {
  try {
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

    const promt = `Analyze the following expense description and choose the single best category from the list: "Marketing", "Software", "Travel", "Supplies", "Meals & Entertainment", "Other". Respond with *only* the category name.

    Description: ${description}`

    const result = await model.generateContent(promt);

    return result.response.text();
    
  } catch (error) {
    console.log(error.message);
  }
}

export default predictCategory;