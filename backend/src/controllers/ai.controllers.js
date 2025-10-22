import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import model from "../api/geminiService.api.js";
import z from "zod";

const predictCategory = asyncHandler(async (req, res) => {
   const categorySelectionSchema = z.object({
        description: z.string().trim().min(1, {message: "Description is empty"})
    });

    const validationResult = categorySelectionSchema.safeParse(req.body);

    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
        throw new ApiError(400, errorMessages);
    }

    const { description } = validationResult.data;

    const prompt = `Analyze the following expense description and choose the single best category from the list: "Marketing", "Software", "Travel", "Supplies", "Meals & Entertainment", "Other". Respond with *only* the category name.

    Description: ${description}`;

    const result = await model.generateContent(prompt);

    const category = result.response.text().trim();

    if (!category) {
        throw new ApiError(500, "Something went wrong while predicting the category");
    }
    
    return res.status(200)
        .json(new ApiResponse(200, { category }, "Category predicts successfully")); 
});

export { predictCategory }