import mongoose, { Schema } from "mongoose";

const lineItemSchema = new Schema({
    description: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    total: {
        type: Number,
        required: true,
    },
});

const invoiceSchema = new Schema(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },
        clientId: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: true,
            index: true,
        },
        invoiceNumber: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["draft", "sent", "paid", "overdue", "void"],
            default: "draft",
            index: true,
        },
        issueDate: {
            type: Date,
            required: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        lineItems: [lineItemSchema],
        subtotal: {
            type: Number,
            required: true,
        },
        tax: {
            rate: {
                type: Number,
                default: 0,
            },
            amount: {
                type: Number,
                default: 0,
            },
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        amountPaid: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
            trim: true,
        },
        terms: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);