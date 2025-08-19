import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },
        category: {
            type: String,
            required: true,
            enum: ["Marketing", "Software", "Travel", "Supplies", "Meals & Entertainment", "Other"],
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        expenseDate: {
            type: Date,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

export const Expense = mongoose.model("Expense", expenseSchema);