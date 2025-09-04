import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Organization } from "../models/organizations.model.js";
import { Expense } from "../models/expenses.model.js";
import z from "zod";

const createExpense = asyncHandler(async (req, res) => {
    const createExpenseSchema = z.object({
            category: z.enum(["Marketing", "Software", "Travel", "Supplies", "Meals & Entertainment", "Other"],
                {
                    required_error: "Expense category is required"
                }
            ),
            description: z.string().trim().min(1, {message: "Description cannot be empty"}),
            amount: z.number().positive({message: "Amount must be positive"}),
            expenseDate: z.coerce.date({
                required_error: "Expense date is required",
                invalid_type_error: "Invalid date format",
            })
    });

    const validationResult = createExpenseSchema.safeParse(req.body);

    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
        throw new ApiError(400, errorMessages);
    }

    const { category, description, amount, expenseDate } = validationResult.data;

    const organization = await Organization.findOne({ ownerId: req?.user?._id });

    if (!organization) {
        throw new ApiError(404, "Cannot create expense no organization found for this user");
    }

    const expense = await Expense.create({
        organizationId: organization._id,
        category,
        description,
        amount,
        expenseDate
    });

    if (!expense) {
        throw new ApiError(500, "Something went wrong while creating a new expense");
    }

    return res.status(201)
        .json(new ApiResponse(201, expense, "Expense created successfully"));
});

const getAllExpenses = asyncHandler(async (req, res) => {
    const organization = await Organization.findOne({ ownerId: req?.user?._id });

    if (!organization) {
        throw new ApiError(404, "Cannot fetch expenses no organization found for this user");
    }

    const { category, month, year } = req.query;

    let filter = {
        organizationId: organization._id
    };

    if (category && category !== "all") {
        filter.category = category;
    }

    if (year && year !== "all") {
        const yearNum = parseInt(year);
        let startDate; let endDate;

        if (month && month !== "all") {
            const monthNum = parseInt(month);
            startDate = new Date(yearNum, monthNum - 1, 1);
            endDate = new Date(yearNum, monthNum, 1);
        } else {
            startDate = new Date(yearNum, 0, 1);
            endDate = new Date(yearNum + 1, 0, 1);
        }

        filter.expenseDate = {
            $gte: startDate,
            $lt: endDate
        };
    }

    const expenses = await Expense.find(filter);

    if (expenses === null) {
        throw new ApiError(500, "Something went wrong while fetching the expenses");
    }

    return res.status(200)
        .json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

const updateExpense = asyncHandler(async (req, res) => {
    const updateExpenseSchema = z.object({
        category: z.enum(
            ["Marketing", "Software", "Travel", "Supplies", "Meals & Entertainment", "Other"]
        ).optional(),

        description: z.string().trim().min(1, { message: "Description cannot be empty" }).optional(),

        amount: z.number().positive({ message: "Amount must be a positive number" }).optional(),

        expenseDate: z.coerce.date({
            invalid_type_error: "Invalid date format",
        }).optional(),
    });

    const validationResult = updateExpenseSchema.safeParse(req.body);
    const _id = req.params.id;

    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
        throw new ApiError(400, errorMessages);
    }

    const validationData = validationResult.data;

    const organization = await Organization.findOne({ ownerId: req?.user?._id });

    if (!organization) {
        throw new ApiError(404, "Cannot update expense no organization found for this user");
    }

    const updatedExpense = await Expense.findOneAndUpdate(
        {
            organizationId: organization._id,
            _id
        },
        {
            $set: validationData
        },
        {
            new: true
        }
    );

    if (!updatedExpense) {
        throw new ApiError(404, "Expense not found or you don't have permission to update it");
    }

    return res.status(200)
        .json(new ApiResponse(200, updatedExpense, "Expense updated successfully"));
});

const deleteExpense = asyncHandler(async (req, res) => {
    const organization = await Organization.findOne({ ownerId: req?.user?._id });

    if (!organization) {
        throw new ApiError(404, "Cannot delete expense no organization found for this user");
    }

    const _id = req.params.id;

    const deletedExpense = await Expense.deleteOne({
        organizationId: organization._id,
        _id
    });

    if (deletedExpense.deletedCount === 0) {
        throw new ApiError(404, "Expense not found or you do not have permission to delete it");
    }

    return res.status(200)
        .json(new ApiResponse(200, {}, "Expense deleted successfully"));
});

export { createExpense, getAllExpenses, updateExpense, deleteExpense };